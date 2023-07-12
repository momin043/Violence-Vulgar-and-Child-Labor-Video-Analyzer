import keras
from keras.preprocessing.image import ImageDataGenerator
from keras.applications import MobileNetV2, EfficientNetB4, MobileNetV3Large
from keras.layers import Dense, Flatten, Dropout
from keras import Model
from keras.optimizers import Adam
from keras.callbacks import EarlyStopping
from keras.regularizers import l2


#Did the stuff written below to get rid of the error of image being truncated and stuff xD
#but i ended up doing it in the file itself XD
# from PIL import ImageFile
# ImageFile.LOAD_TRUNCATED_IMAGES = True

from keras.metrics import TrueNegatives, TruePositives, FalseNegatives, FalsePositives

image_generator = ImageDataGenerator()

traindata = image_generator.flow_from_directory(directory=r"Z:\All Datasets\Main Model\Train",
                                                target_size=(224, 224))

testdata = image_generator.flow_from_directory(directory=r"Z:\All Datasets\Main Model\Test",
                                               target_size=(224, 224))

# print(len(traindata))
# print(len(testdata))


# Building model for MobileNetV3, freezing layers, so we can train it on our own model

model_MobileNetV3Large = MobileNetV3Large(input_shape=(224, 224, 3),weights='imagenet')
# input_shape=(128, 128, 3), include_top=False, weights='imagenet'
model_MobileNetV3Large.summary()
# reg = 0.001
# model_MobileNetV3Large.layers.pop()
#
# # x = Flatten()(model_MobileNetV3Large.output)
# outputs = Dense(4, activation="softmax")
# outputs = outputs(model_MobileNetV3Large.layers[-2].output)
#
# input = model_MobileNetV3Large.input
#
# for layer1 in model_MobileNetV3Large.layers[:-1]:
#     layer1.trainable = False
#
# x = Dropout(0.5)(outputs)
# outputs = Dense(4, activation="softmax")(x)
# model_MobileNetV3Large = Model(inputs=input, outputs=outputs)
#
# opt = Adam(lr=0.001)
# callback = EarlyStopping(monitor='val_loss', patience=4)
#
# model_MobileNetV3Large.compile(optimizer=opt, loss=keras.losses.categorical_crossentropy,
#                                metrics=['accuracy',keras.metrics.Precision(), keras.metrics.Recall()])
# model_MobileNetV3Large.fit(traindata, validation_data=testdata, epochs=20, callbacks=[callback])
# model_MobileNetV3Large.save('MainModel Dropout 224x224 lr=0.0001 PT=4 20Epoch.h5')
