import psycopg2
import sys
from psycopg2 import Error
import psycopg2.extras as extras
from flask import Flask, jsonify, request
import jwt
from datetime import datetime, timedelta
from flask_cors import CORS

from keras import models
import time
import numpy as np
import cv2
import os

modelmain = models.load_model(
    r"Z:\Uni stuff\Momin\FYP Models\MainModel 224 full lower lr\MainModel 224x224 lr=0.000001    PT=5.h5")
modelvio = models.load_model(
    r"Z:\Uni stuff\Momin\FYP Models\Violence Reduced but lower lr 224\ViolenceDetection 224x224 lr=0.00001 PT=5 (Reduced Dataset).h5")
modelvul = models.load_model(
    r"Z:\Uni stuff\Momin\FYP Models\NFSW lr 00001 224\NSFW detection 224x224 lr=0.00001 PT=5 20Epoch.h5")

app = Flask(__name__)
CORS(app, origins=["http://localhost:4200"])

# Connecting Database

params_dic = {
    "host": "localhost",
    "database": "SV2C",
    "user": "postgres",
    "password": "postgres"
}

conn = None
try:
    # connect to the PostgreSQL server
    print('Connecting to the PostgreSQL database...')
    conn = psycopg2.connect(**params_dic)
    if conn:
        print("DB Connected")
        cursor = conn.cursor()
        # cursor.execute("select * from biryani")
except (Exception, psycopg2.DatabaseError) as error:
    print(error)
    sys.exit(1)


@app.route('/register', methods=['POST'])  #API for registering user
def register_user():
    email = request.json.get('email')
    fname = request.json.get('fname')
    lname = request.json.get('lname')
    contact_no = request.json.get('contact')
    password = request.json.get('password')
    gender = request.json.get('gender')

    query_to_get_id = "Select Count(*) from Account"
    cursor.execute(query_to_get_id)
    conn.commit()
    total_accounts = cursor.fetchall()
    print(total_accounts)
    print(total_accounts[0][0])
    if total_accounts[0][0] > 0:
        next_acc_id = total_accounts[0][0] + 1
        print(next_acc_id)
        query = "INSERT INTO Account values (%s,%s,%s,%s,%s,%s,%s)"
        values = (next_acc_id, fname, lname, email, contact_no, gender, password)
        try:
            cursor.execute(query,values)
            conn.commit()
            return jsonify({'message': 'Account registered successfully'})
        except (Exception, psycopg2.DatabaseError) as error:
            print("Error: %s" % error)
            conn.rollback()
            return {'error': 'Account could not be created. Email already in use!'}
    elif total_accounts[0][0] == 0:
        query = "INSERT INTO Account values (%s,%s,%s,%s,%s,%s,%s)"
        values = ('0', fname, lname, email, contact_no, gender, password)
        try:
            cursor.execute(query, values)
            conn.commit()
            return jsonify({'message': 'Account registered successfully'})
        except (Exception, psycopg2.DatabaseError) as error:
            print("Error: %s" % error)
            conn.rollback()
            return {'error': 'Account does not exist'}


@app.route('/login', methods=['POST'])  #API For user authentication
def authenticate_user():
    email = request.json.get('email')
    password = request.json.get('password')
    # return email,password
    query = "SELECT * FROM Account WHERE email = %s AND acc_password = %s"
    try:
        cursor.execute(query, (email, password))
        conn.commit()
        accounts = cursor.fetchall()
        id = accounts[0][0]
        if accounts:
            payload = {
                'sub': id,
                'exp': datetime.utcnow() + timedelta(minutes=30)
            }
            print(accounts)
            print(accounts[0][0])
            jwt_token = jwt.encode(payload, 'secret_key', algorithm='HS256')

            fullname = accounts[0][1] + ' ' + accounts[0][2]
            email2 = accounts[0][3]
            json_data = {'id': id, 'fullname': fullname, 'email': email2, 'token': jwt_token}
            # return jsonify({'token': jwt_token})
            return jsonify(json_data)
            # return jsonify({'message': 'Valid account'})
        else:
            return jsonify({'message': 'InValid account'})

    except (Exception, psycopg2.DatabaseError) as error:
        print("Error: %s" % error)
        conn.rollback()
        return {'error': 'Account does not exist'}


#below functions are for analytics!
def loadvideo(path):
    vid = cv2.VideoCapture(path)
    unseen_vids_frames = []
    if (vid.isOpened() == False):
        print("Error opening video file")
    while (vid.isOpened()):

        ret, frame = vid.read()
        if ret == True:
            frame_resized = cv2.resize(frame, (224, 224))
            unseen_vids_frames.append(frame_resized)
            # frame.reshape(-1,224,224,3)
            # print(frame.shape)
            # frame = np.reshape(frame, [1, 224, 224, 3])
            # frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            # cv2.imshow('Frame', frame)
            # if cv2.waitKey(25) & 0xFF == ord('q'):
            #     break
        else:
            break
    vid.release()

    return unseen_vids_frames

def loadimage(path):
    img = cv2.imread(path)
    img = cv2.resize(img, (224, 224))
    img = np.expand_dims(img, axis=0)
    return img

def get_file_type(file_path):
    file_extension = os.path.splitext(file_path)[1]
    if file_extension.lower() in ['.jpg', '.jpeg', '.png', '.bmp', '.gif']:
        return 'image'
    elif file_extension.lower() in ['.mp4', '.avi', '.mkv', '.mov']:
        return 'video'
    else:
        return 'unknown'

def pred_vulgar(formatting):
    predictions = modelvul.predict(formatting)
    totalframes = len(formatting)
    full = partial = hentai = 0
    # print(np.where(np.amax(predictions[0])))
    # print(len(predictions))
    # print(predictions)
    for i in predictions:
        MaxElement = np.argmax(i)
        # print(MaxElement)
        if MaxElement == 0:
            hentai += 1
        if MaxElement == 1:
            full += 1
        if MaxElement == 2:
            partial += 1

    # print("Hentai: ", hentai)
    # print("Full: ", full)
    # print("Partial: ", partial)

    # print("Total Frames:", totalframes)
    hentaiperc = hentai / totalframes * 100
    fullperc = full / totalframes * 100
    partialperc = partial / totalframes * 100

    # print("Total Hentai Percentage: ", hentaiperc)
    # print("Total Full Percentage:", fullperc)
    # print("Total Partial Percentage:", partialperc)
    combinedresult = {'hentai_vulgar': hentaiperc, 'full_vulgar': fullperc, 'partial_vulgar': partialperc}
    return combinedresult

def pred_violence(formatting):
    predictions = modelvio.predict(formatting)
    totalframes = len(formatting)
    domestic = violence = weaponized = 0
    # print(np.where(np.amax(predictions[0])))
    # print(len(predictions))
    # print(predictions)
    for i in predictions:
        MaxElement = np.argmax(i)
        # print(MaxElement)
        if MaxElement == 0:
            domestic += 1
        if MaxElement == 1:
            violence += 1
        if MaxElement == 2:
            weaponized += 1

    # print("Domestic: ", domestic)
    # print("Violence: ", violence)
    # print("Weaponized: ", weaponized)

    # print("Total Frames:", totalframes)
    domesticperc = domestic / totalframes * 100
    vioperc = violence / totalframes * 100
    wpperc = weaponized / totalframes * 100

    # print("Total Domestic Percentage: ", domesticperc)
    # print("Total Violence Percentage:", vioperc)
    # print("Total Weaponized Percentage:", wpperc)

    combinedresult = {'d_vio': domesticperc, 'f_vio': vioperc, 'w_vio': wpperc}
    return combinedresult

def pred_main(formatting):
    predictions = modelmain.predict(formatting)
    totalframes = len(formatting)
    child = clean = violence = vulgar = 0
    # print(np.where(np.amax(predictions[0])))
    # print(len(predictions))
    # print(predictions)
    for i in predictions:
        MaxElement = np.argmax(i)
        # print(MaxElement)
        if MaxElement == 0:
            child += 1
        if MaxElement == 1:
            clean += 1
        if MaxElement == 2:
            violence += 1
        if MaxElement == 3:
            vulgar += 1

    # print("Child Labor: ", child)
    # print("Clean Frames:: ", clean)
    # print("Violence: ", violence)
    # print("Vulgar: ", vulgar)
    #
    #
    # print("Total Frames:", totalframes)
    childperc = child / totalframes * 100
    cleanperc = clean / totalframes * 100
    vioperc = violence / totalframes * 100
    vulgarperc = vulgar / totalframes * 100

    # print("Total Child Labor Percentage: ", childperc)
    # print("Total Clean Vid Percentage: ", cleanperc)
    # print("Total Violence Percentage:", vioperc)
    # print("Total Vulgar Percentage:", vulgarperc)

    combinedresult = {'child_labor': childperc, 'clean': cleanperc, 'violence': vioperc, 'vulgar': vulgarperc}
    return combinedresult

def main(path):
    # path = 'r'+path
    print(get_file_type(path))

    if get_file_type(path) == "image":
        frames = loadimage(path)
    elif get_file_type(path) == "video":
        frames = loadvideo(path)
    else:
        print("The file is not an image nor a video")
    formatting = np.asarray(frames)

    # predictions = model.predict(formatting)
    # totalframes = len(formatting)

    mainlabel = pred_main(formatting)  # mainlabel has a list of percentages in a dictionary
    max_key = max(mainlabel, key=lambda k: mainlabel[k])  # max key is the label that had the maximum percentage

    all_predvalues = {'main_label': max_key}
    print(f"The Main Label is: {max_key} with a percentage of {mainlabel[max_key]}")

    if max_key == "violence":
        violabel = pred_violence(formatting)
        max_key_vio = max(violabel, key=lambda k: violabel[k])
        all_predvalues['sec_label'] = max_key_vio
        print(f"The Violence Label is: {max_key_vio} with a percentage of {violabel[max_key_vio]}")
    elif max_key == "vulgar":
        vulgarlabel = pred_vulgar(formatting)
        max_key_vul = max(vulgarlabel, key=lambda k: vulgarlabel[k])
        all_predvalues['sec_label'] = max_key_vul
        print(f"The Vulgar Label is: {max_key_vul} with a percentage of {vulgarlabel[max_key_vul]}")

    return all_predvalues


#API for analytics
@app.route('/analysis', methods=['POST'])
def analytics():
    url = request.json.get('keyword')
    acc_id = request.json.get('acc_id')
    fullname = request.json.get('fullname')
    email = request.json.get('email')
    date = request.json.get('date')
    print(url)
    # query = "Select * from history where acc_id = %s" % id
    # print(url[0],url[1])
    try:
        # countmain = 0
        countmain_vio = 0
        countmain_vul = 0
        countmain_clean = 0
        countmain_child = 0

        countsec = 0
        countsec_wvio = 0
        countsec_fvio = 0
        countsec_dvio = 0
        countsec_fvul = 0
        countsec_pvul = 0
        countsec_hvul = 0
        for i in range(len(url)):
            print(url[i])
            all_labels = main(url[i])
            print(all_labels)
            countmain = 1
            if all_labels['main_label'] == 'violence':
                countmain_vio += 1
            elif all_labels['main_label'] == 'vulgar':
                countmain_vul += 1
            elif all_labels['main_label'] == 'clean':
                countmain_clean += 1
            elif all_labels['main_label'] == 'child_labor':
                countmain_child += 1
            # if all_labels['sec_label'] == 'w_vio':
            #     countsec_wvio += 1
            # elif all_labels['sec_label'] == 'd_vio':
            #     countsec_dvio += 1
            # elif all_labels['sec_label'] == 'f_vio':
            #     countsec_fvio += 1
            # elif all_labels['sec_label'] == 'hentai_vulgar':
            #     countsec_hvul += 1
            # elif all_labels['sec_label'] == 'full_vulgar':
            #     countsec_fvul += 1
            # elif all_labels['sec_label'] == 'partial_vulagar':
            #     countsec_pvul += 1
            if i == 0:
                if 'sec_label' in all_labels:
                    countsec = 1
                    columns = ['acc_id', 'fullname', 'email', 'searchedkeyword', 'urls', 'search_date',
                               all_labels['main_label'], all_labels['sec_label']]
                    if all_labels['sec_label'] == 'w_vio':
                        countsec_wvio += 1
                        values = (acc_id, fullname, email, url, url, date, countmain, countsec_wvio)
                    elif all_labels['sec_label'] == 'd_vio':
                        countsec_dvio += 1
                        values = (acc_id, fullname, email, url, url, date, countmain, countsec_dvio)
                    elif all_labels['sec_label'] == 'f_vio':
                        countsec_fvio += 1
                        values = (acc_id, fullname, email, url, url, date, countmain, countsec_fvio)
                    elif all_labels['sec_label'] == 'hentai_vulgar':
                        countsec_hvul += 1
                        values = (acc_id, fullname, email, url, url, date, countmain, countsec_hvul)
                    elif all_labels['sec_label'] == 'full_vulgar':
                        countsec_fvul += 1
                        values = (acc_id, fullname, email, url, url, date, countmain, countsec_fvul)
                    elif all_labels['sec_label'] == 'partial_vulgar':
                        countsec_pvul += 1
                        values = (acc_id, fullname, email, url, url, date, countmain, countsec_pvul)

                else:
                    columns = ['acc_id', 'fullname', 'email', 'searchedkeyword', 'urls', 'search_date',
                               all_labels['main_label']]
                    values = (acc_id, fullname, email, url, url, date, countmain)
                # construct the SQL query with placeholders
                query = "INSERT INTO history ({}) VALUES ({})".format(
                    ", ".join(columns),  # join column names with commas
                    ", ".join(["%s"] * len(values))  # create placeholders for values
                )
                cursor.execute(query, values)
                conn.commit()
            else:
                if 'sec_label' in all_labels:
                    countsec = 1
                    # print(all_labels['sec_label'])
                    columns = ['acc_id', 'fullname', 'email', 'searchedkeyword', 'urls', 'search_date',
                               all_labels['main_label'], all_labels['sec_label']]
                    if all_labels['main_label'] == 'violence':
                        if all_labels['sec_label'] == 'w_vio':
                            countsec_wvio += 1
                            # print(countmain_vio, "WAAAAAAAAAAA" ,countsec_wvio)
                            values = (acc_id, fullname, email, url, url, date, countmain_vio, countsec_wvio)
                        elif all_labels['sec_label'] == 'd_vio':
                            countsec_dvio += 1
                            values = (acc_id, fullname, email, url, url, date, countmain_vio, countsec_dvio)
                        elif all_labels['sec_label'] == 'f_vio':
                            countsec_fvio += 1
                            values = (acc_id, fullname, email, url, url, date, countmain_vio, countsec_fvio)
                    elif all_labels['main_label'] == 'vulgar':
                        if all_labels['sec_label'] == 'hentai_vulgar':
                            countsec_hvul += 1
                            values = (acc_id, fullname, email, url, url, date, countmain_vul, countsec_hvul)
                        elif all_labels['sec_label'] == 'full_vulgar':
                            countsec_fvul += 1
                            values = (acc_id, fullname, email, url, url, date, countmain_vul, countsec_fvul)
                        elif all_labels['sec_label'] == 'partial_vulgar':
                            countsec_pvul += 1
                            values = (acc_id, fullname, email, url, url, date, countmain_vul, countsec_pvul)

                else:
                    # print(all_labels['main_label'], "OUI OUI BAUGGEEETTEEE")
                    columns = ['acc_id', 'fullname', 'email', 'searchedkeyword', 'urls', 'search_date',
                               all_labels['main_label']]
                    if all_labels['main_label'] == 'clean':
                        values = (acc_id, fullname, email, url, url, date, countmain_clean)
                    elif all_labels['main_label'] == 'child_labor':
                        values = (acc_id, fullname, email, url, url, date, countmain_child)
                    # values = (acc_id, fullname, email, url, url, date, countmain_child)
                # construct the SQL query with placeholders
                query = "UPDATE history SET {} WHERE acc_id = %s AND search_date = %s".format(
                    ", ".join("{} = %s".format(col) for col in columns)  # join column names with commas
                )
                # print(countmain_vio, "WAAAAAAAAAAA", countsec_wvio)
                cursor.execute(query, (*values, acc_id, date))
                conn.commit()

        json_data = {
            'ViolenceTotalCount': countmain_vio,
            'VulgarTotalCount': countmain_vul,
            'ChildLaborCount': countmain_child,
            'CleanCount': countmain_clean,
            'DomesticViolence': countsec_dvio,
            'PhysicalViolence': countsec_fvio,
            'WeaponizedViolence': countsec_wvio,
            'HentaiVulgar': countsec_hvul,
            'FullVulgar': countsec_fvul,
            'PartialVulgar': countsec_pvul,
        }
        return jsonify(json_data)
        # return {'messagee': 'Code ran'}

        # query = "Insert into history (acc_id,fullname,email,searchedkeyword,urls,search_date) values (%s, %s, %s, %s, %s, %s)"
        # values = (acc_id, fullname, email, url, url, date)
    except (Exception, psycopg2.DatabaseError) as error:
        print("Error: %s" % error)
        conn.rollback()
        return {'messagee': 'Error occurred while authenticating the user.'}


if __name__ == '__main__':
    app.run()
