import { Component, HostListener } from '@angular/core';
// import { Data } from '@angular/router';
// import { Console } from 'console';
import * as d3 from 'd3';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';


type Data = {
  name: string;
  count: number;
};
@Component({
  selector: 'app-visualize',
  templateUrl: './visualize.component.html',
  styleUrls: ['./visualize.component.css']
})

export class VisualizeComponent {
  constructor(private http: HttpClient, private datePipe: DatePipe) {
  }

  // Variables for declaring data binding the elements of which i want the data
  //object is then binded in the ngOnInit function with its DOM
  inputsearch: any;
  useridpara: any;
  keywordpara: any;
  hashtagpara: any;

  // dataset: { [key: string]: any } = {
  //   "key1": 80, 
  //   "key2": 100, 
  //   "key3": 56, 
  //   "key4": 180
  // };
  dataset: { [key: string]: any } = {};

  chart1div = document.getElementById('chart') as HTMLElement;
  chart1id: string = 'chart';
  chart2div = document.getElementById('chart1') as HTMLElement;
  chart2id: string = 'chart1';

  ngOnInit() {
    this.useridpara = document.getElementById("userpar") as HTMLParagraphElement;
    this.keywordpara = document.getElementById("keywordpar") as HTMLParagraphElement;
    this.hashtagpara = document.getElementById("hashtagpar") as HTMLParagraphElement;
    // this.useridpara.textContent= "User Id goes here";
    this.inputsearch = document.getElementById("inputkeyword") as HTMLInputElement;

    let data = {
      'ViolenceTotalCount': 27,
      'VulgarTotalCount': 13,
      'ChildLaborCount': 8,
      'CleanCount': 15,
      'DomesticViolence': 7,
      'PhysicalViolence': 13,
      'WeaponizedViolence': 7,
      'HentaiVulgar': 3,
      'FullVulgar': 4,
      'PartialVulgar': 6,
    }
    this.dataset = data
    // this.useridpara.innerText = this.inputsearch.value;
    this.createChart(this.chart1id);
    this.createPieChart();
    // this.getid();
    this.createVioChart();
    this.createVulChart();
    this.createChildChart();
    this.createCleanChart();
    // this.createChart(this.chart2id);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const chartdiv1 = document.getElementById(this.chart1id);
    const chartdiv2 = document.getElementById(this.chart2id);
    this.createChart(this.chart1id);
    this.svgpie.remove();
    this.createPieChart();
    // this.svgdynamic.remove();
    // this.getid();
    this.createVioChart();
    this.createVulChart();
    this.createChildChart();
    this.createCleanChart();
    // this.svgdynamic.remove();
  }

  onSearch() {
    let retrievedSessionUserString = sessionStorage.getItem('sessionUser');
    if (retrievedSessionUserString) {
      this.useridpara.innerText = this.inputsearch.value;
      this.keywordpara.innerText = this.inputsearch.value;
      this.hashtagpara.innerText = this.inputsearch.value;
      let url = 'http://localhost:5000/analysis';
      let data_to_send: any;
      let retrievedSessionUser = JSON.parse(retrievedSessionUserString);
      let today = new Date();
      let formattedDate = this.datePipe.transform(today, 'yyyy-MM-dd');
      let urls: any[] = [];
      const inputString = this.inputsearch.value;
      // urls.push(this.inputsearch.value);
      urls = inputString.split(',')
      const cleanedUrls = urls.map((url) => url.replace(/'/g, ""));
      console.log("Cleaned URLS",cleanedUrls);
      console.log("URLS", urls)
      console.log("Input:", this.inputsearch.value)
      data_to_send = {
        'keyword': cleanedUrls,
        'acc_id': retrievedSessionUser.id,
        'fullname': retrievedSessionUser.username,
        'email': retrievedSessionUser.email,
        'date': formattedDate
      };
      // console.log(data_to_send);
      alert("Analysis is in Progress. \nPress okay to Continue!")
      this.http.post(url, data_to_send).subscribe(
        (response: any) => {
          alert("Analysis Done")
          this.dataset = response
          // console.log(this.dataset)
          this.createChart(this.chart1id);
          this.createPieChart();
          this.createVioChart();
          this.createVulChart();
          this.createChildChart();
          this.createCleanChart();
        },
        (error: any) => {
          console.log(error);
        }
      )
    }
    else {
      alert("You need to be logged in to search/perform analytics")
    }

  }

  convertDataintoDiff() {
    const output = Object.keys(this.dataset).map(key => {
      const name = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
      const count = this.dataset[key];
      return { name, count };
    });

    console.log('Converting Data: ', output);
    return output
  }

  svg = d3.select('#chart')
    .append('svg');
  createChart(id: string) {
    this.svg.remove();
    const chartdiv = document.getElementById(id);
    const width = chartdiv ? chartdiv?.offsetWidth : 0;
    const height = chartdiv ? chartdiv?.offsetHeight : 0;

    let dim = {
      "width": width,
      "height": 300
    };
    const margin = {
      top: 0, bottom: 0, left: 20, right: 20
    }

    let output = this.convertDataintoDiff();
    const order = ['Violence Total Count', 'Vulgar Total Count', 'Child Labor Count', 'Clean Count'];

    const outputSubset = output
      .filter(obj => order.includes(obj.name))
      .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

    // let output = this.convertDataintoDiff()
    // const outputSubset = output.filter(obj => {
    //   return ['Violence Total Count', 'Vulgar Total Count', 'Child Labor Count', 'Clean Count'].includes(obj.name);
    // });


    console.log("Subset: ", outputSubset)
    const data = outputSubset
    // const data = [
    //   { name: 'Violence', count: 27 },
    //   { name: 'Vulgar', count: 13 },
    //   { name: 'Child Labor', count: 8 },
    //   { name: 'Clean', count: 15 },
    // ];


    this.svg = d3.select('#' + id)
      .append('svg')
      .attr('width', dim.width - margin.left - margin.right)
      .attr('height', dim.height + 50)
      .attr('viewBox', '0 0 100% 100%');

    const names = data.map((d) => d.name);

    const scaleX = d3.scaleBand()
      .domain(names)
      // .domain(d3.range(data.length).map((d) => d.toString()))
      .range([0, dim.width - margin.left - margin.right])
      .padding(0.2);

    const scaleY = d3.scaleLinear()
      .domain([0, 2 + (d3.max(data, d => d.count) as number)]) //[0, d3.max(data) as number
      .range([dim.height, 0]);


    let maxCount = d3?.max(data, d => d.count) ?? 0;
    let ticks: number[] = []
    if (maxCount % 2 > 0) {
      maxCount += 1;
    }
    for (let i = 0; i <= maxCount; i += 2) {
      ticks.push(i)
    }

    if (ticks.length === 0) {
      let arr = [0, 5, 10, 15, 20, 25, 30, 35]
      ticks.push(...arr);
    }
    var gridlines = d3.axisLeft(scaleY)
      .tickValues(ticks)
      .tickSize(-innerWidth);
    this.svg.append("g")
      .call(gridlines);

    const categories = ['Violence', 'Vulgar', 'Child Labor', 'Clean'];
    const colors = d3.scaleOrdinal()
      .domain(categories)
      .range(['#ff0000', '#FFBF00', '#E0115F', '#4CBB17']);

    this.svg.append('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('class', 'rectangle')
      .attr('x', (d) => scaleX(d.name)!)
      .attr('rx', 3) // set the x-axis radius to 5
      // .attr('x', (d, i) => scaleX(i.toString())!)
      .attr('y', (d) => scaleY(d.count))
      .attr('width', scaleX.bandwidth())
      .attr('height', (d) => scaleY(0) - scaleY(d.count))
      .attr('fill', d => colors(d.name) as string);


    //The code below is good but if your xaxis wala data has 0,1,2,3,4 etc instead of having the actual label
    // this.svg.append('g')
    //   .attr('fill', 'black')
    //   .attr('text-anchor', 'middle')
    //   .attr('font-size', '12px')
    //   .selectAll('text')
    //   .data(data)
    //   .join('text')
    //   .attr('x', (d, i) => scaleX(i.toString())! + scaleX.bandwidth() / 2)
    //   .attr('y', (d) => scaleY(d.count) - 5)
    //   .attr('font-weight', 'bold')
    //   .text((d) => d.count.toString())
    //   .append("tspan")
    //   .attr("x", (d, i) => scaleX(i.toString())! + scaleX.bandwidth() / 2)
    //   .attr("y", (d) => scaleY(d.count) + 15)
    //   .text((d) => d.name);


    const xAxis = d3.axisBottom(scaleX);
    const yAxis = d3.axisLeft(scaleY);


    this.svg.append('g')
      .attr('transform', `translate(0, ${dim.height + 1})`)
      .call(xAxis);

    this.svg.append('g')
      .attr('transform', `translate(${margin.left} , 0)`)
      .call(yAxis);

    this.svg.selectAll('.tick line')
      .attr('stroke', 'black')
      .attr('stroke-width', 0.5);
  }

  svgpie = d3.select("#piechart")
    .append('svg');
  createPieChart() {
    this.svgpie.remove();

    // let output = this.convertDataintoDiff()
    // const outputSubset = output.filter(obj => {
    //   return ['Violence Total Count', 'Vulgar Total Count', 'Child Labor Count', 'Clean Count'].includes(obj.name);
    // });

    // console.log("Subset: ", outputSubset)
    let output = this.convertDataintoDiff();
    const order = ['Violence Total Count', 'Vulgar Total Count', 'Child Labor Count', 'Clean Count'];

    const outputSubset = output
      .filter(obj => order.includes(obj.name))
      .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    const data = outputSubset
    // const data = [
    //   { name: 'Violence', count: 27 },
    //   { name: 'Vulgar', count: 13 },
    //   { name: 'Child Labor', count: 8 },
    //   { name: 'Clean', count: 15 },
    // ];

    const piechartdiv = document.getElementById("piechart");
    const width = piechartdiv ? piechartdiv?.offsetWidth : 0;
    console.log("Widthh: ", width)
    // const width = 400;
    const height = 300;
    const radius = Math.min(width, height) / 2.5;

    // Create SVG element
    this.svgpie = d3.select('#piechart')
      .append('svg')
      .attr('width', width)
      .attr('height', height);


    // this.svgpie.append('g')
    //   .attr('transform', `translate(${width / 3}, ${height / 2})`);
    const g = this.svgpie.append('g')
      .attr('transform', `translate(${width / 3}, ${height / 2})`);
    // const svg = d3.select('#piechart')
    //   .append('svg')
    //   .attr('width', width)
    //   .attr('height', height)
    //   .append('g')
    //   .attr('transform', `translate(${width / 3}, ${height / 2})`);
    // this.svgpie = svg;
    // Define colors
    // const colors = d3.scaleOrdinal(d3.schemeCategory10);
    const categories = ['Violence', 'Vulgar', 'Child Labor', 'Clean'];
    const colors = d3.scaleOrdinal()
      .domain(categories)
      .range(['#ff0000', '#FFBF00', '#E0115F', '#4CBB17']);

    // Define pie layout
    const pie = d3.pie<{ name: string, count: number }>()
      .value((d) => d.count as number)
      .sort(null);

    // Define arc shape
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    // Draw slices
    const slices = g.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', (d: any) => arc(d))
      .attr('fill', (d, i) => colors(d.data.name) as string);
    // (d:any) => colors(d.name as any) as string

    // Add text to each slice
    // const labels = svg.selectAll('text')
    //   .data(pie(data))
    //   .enter()
    //   .append('text')
    //   .attr('transform', d => `translate(${arc.centroid(d)})`)
    //   .attr('dy', '0.35em')
    //   .text(d => d.data.name)
    //   .style('text-anchor', 'middle');
    // Add legend
    const legend = g.selectAll('.legend')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(-${width / 2}, ${i * 20 - height / 2})`);

    legend.append('rect')
      .attr('x', width - 120)
      .attr('y', 4)
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', (d: any) => colors(d.name as any) as string);

    legend.append('text')
      .attr('x', width - 92)
      .attr('y', 12)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .text(d => d.name);

  }
  svgvio = d3.select("#vio")
    .append('svg');
  svgvul = d3.select("#vul")
    .append('svg');
  svgclean = d3.select("#clean")
    .append('svg');
  svgchild = d3.select("#child")
    .append('svg');
  createVioChart() {
    let outputvio = this.convertDataintoDiff();
    const ordervio = ['Physical Violence', 'Domestic Violence', 'Weaponized Violence'];

    const outputSubsetvio = outputvio
      .filter(obj => ordervio.includes(obj.name))
      .sort((a, b) => ordervio.indexOf(a.name) - ordervio.indexOf(b.name));
    const data = outputSubsetvio;
    this.svgvio.remove();
    const chartdivvio = document.getElementById("vio");
    const width = chartdivvio ? chartdivvio?.offsetWidth : 0;
    const height = 200;
    const margin = {
      top: 0, bottom: 0, left: 20, right: 10
    }
    this.svgvio = d3.select('#vio')
      .append('svg')
      .attr('width', width - margin.left - margin.right)
      .attr('height', height + 50)
      .attr('viewBox', '0 0 100% 100%');

    const names = data.map((d) => d.name);

    const scaleX = d3.scaleBand()
      .domain(names)
      .range([0, width - margin.left - margin.right])
      .padding(0.25);

    const scaleY = d3.scaleLinear()
      .domain([0, 2 + (d3.max(data, d => d.count) as number)]) //[0, d3.max(data) as number
      .range([height, 0]);

    let maxCount = d3?.max(data, d => d.count) ?? 0;
    let ticks: number[] = []
    if (maxCount % 2 > 0) {
      maxCount += 1;
    }
    for (let i = 0; i <= maxCount; i += 2) {
      ticks.push(i)
    }

    if (ticks.length === 0) {
      let arr = [0, 5, 10, 15, 20, 25, 30, 35]
      ticks.push(...arr);
    }
    var gridlines = d3.axisLeft(scaleY)
      .tickValues(ticks)
      .tickSize(-innerWidth);
    this.svgvio.append("g")
      .call(gridlines);


    const categories = ['Physical Violence', 'Weaponized Violence', 'Domestic Violence'];
    const colors = d3.scaleOrdinal()
      .domain(categories)
      .range(['#A7C7E7', '#6082B6', '#7393B3']);

    this.svgvio.append('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('class', 'rectangle')
      .attr('x', (d) => scaleX(d.name)!)
      .attr('rx', 3) // set the x-axis radius to 5
      // .attr('x', (d, i) => scaleX(i.toString())!)
      .attr('y', (d) => scaleY(d.count))
      .attr('width', scaleX.bandwidth())
      .attr('height', (d) => scaleY(0) - scaleY(d.count))
      .attr('fill', d => colors(d.name) as string);

    const xAxis = d3.axisBottom(scaleX);
    const yAxis = d3.axisLeft(scaleY);


    this.svgvio.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    this.svgvio.append('g')
      .attr('transform', `translate(${margin.left} , 0)`)
      .call(yAxis);

    this.svgvio.selectAll('.tick line')
      .attr('stroke', 'black')
      .attr('stroke-width', 0.5);
  }

  createVulChart() {
    let outputvul = this.convertDataintoDiff();
    const ordervul = ['Partial Vulgar', 'Hentai Vulgar', 'Full Vulgar'];

    const outputSubsetvul = outputvul
      .filter(obj => ordervul.includes(obj.name))
      .sort((a, b) => ordervul.indexOf(a.name) - ordervul.indexOf(b.name));
    const data = outputSubsetvul;
    // const data = [
    //   { name: 'Violence', count: 10 },
    //   { name: 'Weaponized', count: 12 },
    //   { name: 'Domestic', count: 5 },
    // ];
    this.svgvul.remove();
    const chartdivvul = document.getElementById("vul");
    const width = chartdivvul ? chartdivvul?.offsetWidth : 0;
    // const height = chartdiv ? chartdiv?.offsetHeight : 0;
    const height = 200;
    // let dim = {
    //   "width": width,
    //   "height": 300
    // };
    const margin = {
      top: 0, bottom: 0, left: 20, right: 10
    }
    this.svgvul = d3.select('#vul')
      .append('svg')
      .attr('width', width - margin.left - margin.right)
      .attr('height', height + 50)
      .attr('viewBox', '0 0 100% 100%');

    const names = data.map((d) => d.name);

    const scaleX = d3.scaleBand()
      .domain(names)
      // .domain(d3.range(data.length).map((d) => d.toString()))
      .range([0, width - margin.left - margin.right])
      .padding(0.25);

    const scaleY = d3.scaleLinear()
      .domain([0, 2 + (d3.max(data, d => d.count) as number)]) //[0, d3.max(data) as number
      .range([height, 0]);

    let maxCount = d3?.max(data, d => d.count) ?? 0;
    let ticks: number[] = []
    if (maxCount % 2 > 0) {
      maxCount += 1;
    }
    for (let i = 0; i <= maxCount; i += 2) {
      ticks.push(i)
    }

    if (ticks.length === 0) {
      let arr = [0, 5, 10, 15, 20, 25, 30, 35]
      ticks.push(...arr);
    }
    var gridlines = d3.axisLeft(scaleY)
      .tickValues(ticks)
      .tickSize(-innerWidth);
    this.svgvul.append("g")
      .call(gridlines);

    const categories = ['Partial Vulgar', 'Hentai Vulgar', 'Full Vulgar'];
    const colors = d3.scaleOrdinal()
      .domain(categories)
      .range(['#F8DE7E', '#F4C430', '#E4D00A']);

    this.svgvul.append('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('class', 'rectangle')
      .attr('x', (d) => scaleX(d.name)!)
      .attr('rx', 3) // set the x-axis radius to 5
      // .attr('x', (d, i) => scaleX(i.toString())!)
      .attr('y', (d) => scaleY(d.count))
      .attr('width', scaleX.bandwidth())
      .attr('height', (d) => scaleY(0) - scaleY(d.count))
      .attr('fill', d => colors(d.name) as string);

    const xAxis = d3.axisBottom(scaleX);
    const yAxis = d3.axisLeft(scaleY);


    this.svgvul.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    this.svgvul.append('g')
      .attr('transform', `translate(${margin.left} , 0)`)
      .call(yAxis);

    this.svgvul.selectAll('.tick line')
      .attr('stroke', 'black')
      .attr('stroke-width', 0.5);
  }

  createChildChart() {
    let outputchild = this.convertDataintoDiff();
    const orderchild = ['Child Labor Count'];

    const outputSubsetchild = outputchild
      .filter(obj => orderchild.includes(obj.name))
      .sort((a, b) => orderchild.indexOf(a.name) - orderchild.indexOf(b.name));
    const data = outputSubsetchild;
    // const data = [
    //   { name: 'Violence', count: 10 },
    //   { name: 'Weaponized', count: 12 },
    //   { name: 'Domestic', count: 5 },
    // ];
    this.svgchild.remove();
    const chartdivchild = document.getElementById("child");
    const width = chartdivchild ? chartdivchild?.offsetWidth : 0;
    // const height = chartdiv ? chartdiv?.offsetHeight : 0;
    const height = 200;
    // let dim = {
    //   "width": width,
    //   "height": 300
    // };
    const margin = {
      top: 0, bottom: 0, left: 20, right: 10
    }
    this.svgchild = d3.select('#child')
      .append('svg')
      .attr('width', width - margin.left - margin.right)
      .attr('height', height + 50)
      .attr('viewBox', '0 0 100% 100%');

    const names = data.map((d) => d.name);

    const scaleX = d3.scaleBand()
      .domain(names)
      // .domain(d3.range(data.length).map((d) => d.toString()))
      .range([0, width - margin.left - margin.right])
      .padding(0.25);

    const scaleY = d3.scaleLinear()
      .domain([0, 2 + (d3.max(data, d => d.count) as number)]) //[0, d3.max(data) as number
      .range([height, 0]);

    let maxCount = d3?.max(data, d => d.count) ?? 0;
    let ticks: number[] = []
    if (maxCount % 2 > 0) {
      maxCount += 1;
    }
    for (let i = 0; i <= maxCount; i += 2) {
      ticks.push(i)
    }

    if (ticks.length === 0) {
      let arr = [0, 5, 10, 15, 20, 25, 30, 35]
      ticks.push(...arr);
    }
    var gridlines = d3.axisLeft(scaleY)
      .tickValues(ticks)
      .tickSize(-innerWidth);
    this.svgchild.append("g")
      .call(gridlines);

    const categories = ['Child Labor Count'];
    const colors = d3.scaleOrdinal()
      .domain(categories)
      .range(['#E0115F']);

    this.svgchild.append('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('class', 'rectangle')
      .attr('x', (d) => scaleX(d.name)!)
      .attr('rx', 3) // set the x-axis radius to 5
      // .attr('x', (d, i) => scaleX(i.toString())!)
      .attr('y', (d) => scaleY(d.count))
      .attr('width', scaleX.bandwidth())
      .attr('height', (d) => scaleY(0) - scaleY(d.count))
      .attr('fill', d => colors(d.name) as string);

    const xAxis = d3.axisBottom(scaleX);
    const yAxis = d3.axisLeft(scaleY);


    this.svgchild.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    this.svgchild.append('g')
      .attr('transform', `translate(${margin.left} , 0)`)
      .call(yAxis);

    this.svgchild.selectAll('.tick line')
      .attr('stroke', 'black')
      .attr('stroke-width', 0.5);
  }

  createCleanChart() {
    let outputclean = this.convertDataintoDiff();
    const orderclean = ['Clean Count'];

    const outputSubsetclean = outputclean
      .filter(obj => orderclean.includes(obj.name))
      .sort((a, b) => orderclean.indexOf(a.name) - orderclean.indexOf(b.name));
    const data = outputSubsetclean;
    // const data = [
    //   { name: 'Violence', count: 10 },
    //   { name: 'Weaponized', count: 12 },
    //   { name: 'Domestic', count: 5 },
    // ];
    this.svgclean.remove();
    const chartdivclean = document.getElementById("child");
    const width = chartdivclean ? chartdivclean?.offsetWidth : 0;
    // const height = chartdiv ? chartdiv?.offsetHeight : 0;
    const height = 200;
    // let dim = {
    //   "width": width,
    //   "height": 300
    // };
    const margin = {
      top: 0, bottom: 0, left: 20, right: 10
    }
    this.svgclean = d3.select('#clean')
      .append('svg')
      .attr('width', width - margin.left - margin.right)
      .attr('height', height + 50)
      .attr('viewBox', '0 0 100% 100%');

    const names = data.map((d) => d.name);

    const scaleX = d3.scaleBand()
      .domain(names)
      // .domain(d3.range(data.length).map((d) => d.toString()))
      .range([0, width - margin.left - margin.right])
      .padding(0.25);

    const scaleY = d3.scaleLinear()
      .domain([0, 2 + (d3.max(data, d => d.count) as number)]) //[0, d3.max(data) as number
      .range([height, 0]);

    let maxCount = d3?.max(data, d => d.count) ?? 0;
    let ticks: number[] = []
    if (maxCount % 2 > 0) {
      maxCount += 1;
    }
    for (let i = 0; i <= maxCount; i += 2) {
      ticks.push(i)
    }

    if (ticks.length === 0) {
      let arr = [0, 5, 10, 15, 20, 25, 30, 35]
      ticks.push(...arr);
    }
    var gridlines = d3.axisLeft(scaleY)
      .tickValues(ticks)
      .tickSize(-innerWidth);
    this.svgclean.append("g")
      .call(gridlines);

    const categories = ['Clean Count'];
    const colors = d3.scaleOrdinal()
      .domain(categories)
      .range(['#4CBB17']);

    // const categories = ['Partial Vulgar', 'Hentai Vulgar', 'Full Vulgar'];
    // const colors = d3.scaleOrdinal()
    //   .domain(categories)
    //   .range(['#ff0000', '#FFBF00', '#E0115F', '#7CFC00']);

    this.svgclean.append('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('class', 'rectangle')
      .attr('x', (d) => scaleX(d.name)!)
      .attr('rx', 3) // set the x-axis radius to 5
      // .attr('x', (d, i) => scaleX(i.toString())!)
      .attr('y', (d) => scaleY(d.count))
      .attr('width', scaleX.bandwidth())
      .attr('height', (d) => scaleY(0) - scaleY(d.count))
      .attr('fill', d => colors(d.name) as string);

    const xAxis = d3.axisBottom(scaleX);
    const yAxis = d3.axisLeft(scaleY);


    this.svgclean.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    this.svgclean.append('g')
      .attr('transform', `translate(${margin.left} , 0)`)
      .call(yAxis);

    this.svgclean.selectAll('.tick line')
      .attr('stroke', 'black')
      .attr('stroke-width', 0.5);
  }


  //The 2 functions below are not being used, they are for dynamically creating the charts but i was facing responsiveness issues
  // getid() {

  //   const idvio = "vio";
  //   const idvul = "vul";
  //   const idchild = "child";
  //   const idclean = "clean";

  //   let outputvio = this.convertDataintoDiff();
  //   const ordervio = ['Physical Violence', 'Domestic Violence', 'Weaponized Violence'];

  //   const outputSubsetvio = outputvio
  //     .filter(obj => ordervio.includes(obj.name))
  //     .sort((a, b) => ordervio.indexOf(a.name) - ordervio.indexOf(b.name));
  //   const datavio = outputSubsetvio;

  //   // let outputvio = this.convertDataintoDiff();
  //   // const outputSubsetvio = outputvio.filter(obj => {
  //   //   return ['Physical Violence', 'Domestic Violence', 'Weaponized Violence'].includes(obj.name);
  //   // });

  //   // console.log("Subset: ", outputSubsetvio);

  //   // const datavio: Data[] = [
  //   //   { name: 'Violence', count: 10 },
  //   //   { name: 'Weaponized', count: 12 },
  //   //   { name: 'Domestic', count: 5 },
  //   // ];

  //   let outputvul = this.convertDataintoDiff();
  //   const ordervul = ['Partial Vulgar', 'Hentai Vulgar', 'Full Vulgar'];

  //   const outputSubsetvul = outputvul
  //     .filter(obj => ordervul.includes(obj.name))
  //     .sort((a, b) => ordervul.indexOf(a.name) - ordervul.indexOf(b.name));
  //   const datavul = outputSubsetvul;
  //   // let outputvul = this.convertDataintoDiff();
  //   // const outputSubsetvul = outputvul.filter(obj => {
  //   //   return ['Partial Vulgar', 'Hentai Vulgar', 'Full Vulgar'].includes(obj.name);
  //   // });

  //   // console.log("Subset: ", outputSubsetvul);

  //   // const datavul: Data[] = [
  //   //   { name: 'Full', count: 3 },
  //   //   { name: 'Partial', count: 7 },
  //   //   { name: 'Hentai', count: 3 },
  //   // ];


  //   let outputchild = this.convertDataintoDiff();
  //   const orderchild = ['Child Labor Count'];

  //   const outputSubsetchild = outputchild
  //     .filter(obj => orderchild.includes(obj.name))
  //     .sort((a, b) => orderchild.indexOf(a.name) - orderchild.indexOf(b.name));
  //   const datachild = outputSubsetchild;

  //   // let outputchild = this.convertDataintoDiff();
  //   // const outputSubsetchild = outputchild.filter(obj => {
  //   //   return ['Child Labor Count'].includes(obj.name);
  //   // });

  //   // console.log("Subset: ", outputSubsetchild);

  //   // const datachild: Data[] = [
  //   //   { name: 'Child Labor', count: 8 }
  //   // ];


  //   let outputclean = this.convertDataintoDiff();
  //   const orderclean = ['Clean Count'];

  //   const outputSubsetclean = outputclean
  //     .filter(obj => orderclean.includes(obj.name))
  //     .sort((a, b) => orderclean.indexOf(a.name) - orderclean.indexOf(b.name));
  //   const dataclean = outputSubsetclean;
  //   // let outputclean = this.convertDataintoDiff();
  //   // const outputSubsetclean = outputclean.filter(obj => {
  //   //   return ['Clean Count'].includes(obj.name);
  //   // });

  //   // console.log("Subset: ", outputSubsetclean);

  //   // const dataclean: Data[] = [
  //   //   { name: 'Clean', count: 15 }
  //   // ];

  //   // this.svgdynamic.remove();
  //   let svgdynamic = d3.select("#" + idvio)
  //     .append('svg');
  //   this.createDynamicChart(svgdynamic, datavio, idvio);
  //   // svgdynamic.remove();

  //   svgdynamic = d3.select("#" + idvul)
  //     .append('svg');
  //   // svgdynamic.remove();
  //   this.createDynamicChart(svgdynamic, datavul, idvul);
  //   // svgdynamic.remove();

  //   svgdynamic = d3.select("#" + idchild)
  //     .append('svg');
  //   // svgdynamic.remove();
  //   this.createDynamicChart(svgdynamic, datachild, idchild);
  //   // svgdynamic.remove();

  //   svgdynamic = d3.select("#" + idclean)
  //     .append('svg');
  //   // svgdynamic.remove();
  //   this.createDynamicChart(svgdynamic, dataclean, idclean);
  //   // svgdynamic.remove();
  // }
  // // Attempting to create these 4 thingies dynamically
  // createDynamicChart(svgdynamic: any, data: Data[], id: string) {
  //   svgdynamic.remove();
  //   if (id == "vio") {
  //     this.svgvio.remove();
  //   }
  //   else if (id == "vul") {
  //     this.svgvul.remove();
  //   }
  //   else if (id == "clean") {
  //     this.svgclean.remove();
  //   }
  //   else if (id == "child") {
  //     this.svgchild.remove();
  //   }
  //   const chartdivdyn = document.getElementById(id);
  //   const width = chartdivdyn ? chartdivdyn?.offsetWidth : 0;
  //   const height = 200;
  //   const margin = {
  //     top: 0, bottom: 0, left: 20, right: 10
  //   }
  //   // svgdynamic.remove();
  //   svgdynamic = d3.select('#' + id)
  //     .append('svg')
  //     .attr('width', width - margin.left - margin.right)
  //     .attr('height', height + 50)
  //     .attr('viewBox', '0 0 100% 100%');


  //   const names = data.map((d: any) => d.name);

  //   const scaleX = d3.scaleBand()
  //     .domain(names)
  //     // .domain(d3.range(data.length).map((d) => d.toString()))
  //     .range([0, width - margin.left - margin.right])
  //     .padding(0.45);

  //   const scaleY = d3.scaleLinear()
  //     .domain([0, 2 + (d3.max(data, (d) => d.count) as number)]) //[0, d3.max(data) as number
  //     .range([height, 0]);

  //   let maxCount: any = d3?.max(data, (d: any) => d.count) ?? 0;
  //   let ticks: number[] = []
  //   if (maxCount % 2 > 0) {
  //     maxCount += 1;
  //   }
  //   for (let i = 0; i <= maxCount; i += 2) {
  //     ticks.push(i)
  //   }

  //   if (ticks.length === 0) {
  //     let arr = [0, 5, 10, 15, 20, 25, 30, 35]
  //     ticks.push(...arr);
  //   }
  //   var gridlines = d3.axisLeft(scaleY)
  //     .tickValues(ticks)
  //     .tickSize(-innerWidth);
  //   svgdynamic.append("g")
  //     .call(gridlines);

  //   const categories = ['Physical Violence', 'Weaponized Violence', 'Domestic Violence', 'Full Vulgar', 'Partial Vulgar', 'Hentai Vulgar', 'Child Labor Count', 'Clean Count'];
  //   const colors = d3.scaleOrdinal()
  //     .domain(categories)
  //     .range(['#A7C7E7', '#7393B3', '#6082B6', '#F8DE7E', '#E4D00A', '#F4C430', '#E0115F', '#4CBB17']);

  //   svgdynamic.append('g')
  //     .selectAll('rect')
  //     .data(data)
  //     .join('rect')
  //     .attr('class', 'rectangle')
  //     .attr('x', (d: any) => scaleX(d.name)!)
  //     .attr('rx', 3) // set the x-axis radius to 5
  //     // .attr('x', (d, i) => scaleX(i.toString())!)
  //     .attr('y', (d: any) => scaleY(d.count))
  //     .attr('width', scaleX.bandwidth())
  //     .attr('height', (d: any) => scaleY(0) - scaleY(d.count))
  //     .attr('fill', (d: any) => colors(d.name) as string);

  //   const xAxis = d3.axisBottom(scaleX);
  //   const yAxis = d3.axisLeft(scaleY);


  //   svgdynamic.append('g')
  //     .attr('transform', `translate(0, ${height})`)
  //     .call(xAxis);

  //   svgdynamic.append('g')
  //     .attr('transform', `translate(${margin.left} , 0)`)
  //     .call(yAxis);

  //   svgdynamic.selectAll('.tick line')
  //     .attr('stroke', 'black')
  //     .attr('stroke-width', 0.5);

  // }

}


