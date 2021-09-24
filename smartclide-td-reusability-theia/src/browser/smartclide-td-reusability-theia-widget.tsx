import * as React from 'react';
import { injectable, postConstruct, inject } from 'inversify';
import { AlertMessage } from '@theia/core/lib/browser/widgets/alert-message';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core';
import { Interest} from './interest';
import { Principal} from './principal';
import { Reusability} from './reusability';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";


@injectable()
export class SmartclideTdReusabilityTheiaWidget extends ReactWidget {

    static readonly ID = 'smartclide-td-reusability-theia:widget';
    static readonly LABEL = 'Smartclide TD and Reusability';
	
	static state = {
		SonarQubeURL: '',
		InterestServiceURL: '',
		InterestProjectURL: '',
		InterestFileNumber: '',
		ReusabilityServiceURL: '',
		ReusabilityProjectURL: ''
	}
	
	static stateInterest ={
		data: [{ name: "", value: 0 }]
	}
	
	static stateReusability ={
		data: [{ revisionCount: 0, index: 0 }]
	}
	

    @inject(MessageService)
    protected readonly messageService!: MessageService;

    @postConstruct()
    protected async init(): Promise < void> {
        this.id = SmartclideTdReusabilityTheiaWidget.ID;
        this.title.label = SmartclideTdReusabilityTheiaWidget.LABEL;
        this.title.caption = SmartclideTdReusabilityTheiaWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-eur';
        this.update();
    }

    protected render(): React.ReactNode {
        const header = `Provide SonarQube URL instance and get latest results.`;
        const header2 = `Provide git URL and get latest results.`;
        const header3 = `Provide git URL and get results.`;
		
		const interestInstance= new Interest();
		const principalInstance= new Principal();
		const reusabilityInstance= new Reusability();

        return <div id='widget-container'>
			<ul>
				<li><span id='menuPrincipal' className='active' onClick={_a => this.clickMenu('menuPrincipal','td-principal')}>TD Principal</span></li>
				<li><span id='menuInterest' onClick={_a => this.clickMenu('menuInterest','td-interest')}>TD Interest</span></li>
				<li><span id='menuReusability' onClick={_a => this.clickMenu('menuReusability','reusability')}>Reusability</span></li>
			</ul>
			<div id='td-principal'>
				<AlertMessage type='INFO' header={header} />
				<input onChange={this.updateInput} placeholder='SonarQube URL' name='SonarQubeURL'/>
				<button className='theia-button secondary' title='Load Last Analysis' onClick={_a => principalInstance.runprocessGetMetrics(this.messageService)}>Load Last Analysis</button>
				<p id='TDIndex'></p>
				<p id='issuesNumber'></p>
				<div id='issues'></div>
			</div>
			<div id='td-interest'>
				<AlertMessage type='INFO' header={header2} />
				<input onChange={this.updateInput} placeholder='Interest Service URL' name='InterestServiceURL'/>
				<input onChange={this.updateInput} placeholder='Project URL' name='InterestProjectURL'/>
				<button className='theia-button secondary' title='Load Interest' onClick={_a => interestInstance.runprocessGetInterest(this.messageService)}>Load Interest</button>
				<button className='theia-button secondary' title='Analyze Interest' onClick={_a => interestInstance.runprocessAnalyzeInterest(this.messageService)}>Analyze Interest</button>
				<p id='TDIndexInterest'></p>
				<div id='interest-buttons' className='ShowHide-buttons'>
					<button id='interest-ShowHideFiles' className='theia-button secondary' title='Hide Files' onClick={_a => interestInstance.runprocessShowFiles()}>Hide Files</button>
					<button id='interest-ShowHideChart' className='theia-button secondary' title='Show Evolution' onClick={_a => interestInstance.runprocessShowEvolution()}>Show Evolution</button>
				</div>
				<div id='chartInterest' className='chart'></div>
				<div id='filesInterest'></div>
			</div>
			<div id='reusability'>
				<AlertMessage type='INFO' header={header3} />
				<input onChange={this.updateInput} placeholder='Reusability Service URL' name='ReusabilityServiceURL'/>
				<input onChange={this.updateInput} placeholder='Project URL' name='ReusabilityProjectURL'/>
				<button className='theia-button secondary' title='Load Reusability' onClick={_a => reusabilityInstance.runprocessLoadReusability(this.messageService)}>Load Reusability</button>
				<p id='indexReusability'></p>
				<div id='reusability-buttons' className='ShowHide-buttons'>
					<button id='reusability-ShowHideFiles' className='theia-button secondary' title='Hide Files' onClick={_a => reusabilityInstance.runprocessShowFiles()}>Hide Files</button>
					<button id='reusability-ShowHideChart' className='theia-button secondary' title='Show Evolution' onClick={_a => reusabilityInstance.runprocessShowEvolution()}>Show Evolution</button>
				</div>
				<div id='chartReusability' className='chart'></div>
				<div id='filesReusability'></div>
			</div>
			
		</div>
    }

	//click for menu item
	protected clickMenu(menuItem: string, divId:string): void {
		//change class of items for menu appearance
		document.getElementById('menuPrincipal')!.className='';
		document.getElementById('menuInterest')!.className='';
		document.getElementById('menuReusability')!.className='';
		document.getElementById(menuItem)!.className='active';
		
		//change appearance
		(document.getElementById("td-principal") as HTMLElement).style.display = "none";
		(document.getElementById("td-interest") as HTMLElement).style.display = "none";
		(document.getElementById("reusability") as HTMLElement).style.display = "none";
		(document.getElementById(divId) as HTMLElement).style.display = "block";
	}
	
	//update the state
	updateInput (e: React.ChangeEvent<HTMLInputElement>) {
		const key =e.currentTarget.name as keyof typeof SmartclideTdReusabilityTheiaWidget.state
		SmartclideTdReusabilityTheiaWidget.state[key] = e.currentTarget.value;
    }



	//create chart Interest
	static createChartInterest():void{
		//remove previous
		am4core.disposeAllCharts();
		(document.getElementById('chartInterest') as HTMLElement).innerHTML= '';

		//create
		am4core.useTheme(am4themes_animated);
		let chart = am4core.create("chartInterest", am4charts.XYChart);
		chart.data = SmartclideTdReusabilityTheiaWidget.stateInterest.data;

		// Create axes
		let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.dataFields.category = "name";
		var valueAxisY = chart.yAxes.push(new am4charts.ValueAxis());

		// Create series
		let series = chart.series.push(new am4charts.LineSeries());
		series.stroke = am4core.color("#7973ff");
		series.strokeWidth = 2;
		series.dataFields.valueY = 'value';
		series.dataFields.categoryX = 'name';
		series.minBulletDistance = 10;
		series.tooltipText = "{valueY}"+" €";
	
		// Configure grid
		valueAxisY.renderer.grid.template.strokeOpacity = 1;
		valueAxisY.renderer.grid.template.stroke = am4core.color("#666666");
		valueAxisY.renderer.grid.template.strokeWidth = 1;
		categoryAxis.renderer.grid.template.strokeOpacity = 1;
		categoryAxis.renderer.grid.template.stroke = am4core.color("#666666");
		categoryAxis.renderer.grid.template.strokeWidth = 1;

		// Configure labels
		valueAxisY.renderer.labels.template.fill = am4core.color("#666666");
		categoryAxis.renderer.labels.template.fill = am4core.color("#666666");

		//customatize scrollbar
		chart.scrollbarX = new am4core.Scrollbar();
		chart.scrollbarX.minHeight=10;
		SmartclideTdReusabilityTheiaWidget.customizeGrip(chart.scrollbarX.startGrip);
		SmartclideTdReusabilityTheiaWidget.customizeGrip(chart.scrollbarX.endGrip);

		//zoom out button
		chart.zoomOutButton.align = "left";
		chart.zoomOutButton.valign = "top";
		chart.zoomOutButton.marginLeft = 10;
		chart.zoomOutButton.marginTop = 10;

		// Add cursor
		chart.cursor = new am4charts.XYCursor();
		chart.cursor.xAxis = categoryAxis;
		chart.cursor.snapToSeries = series;
	}

	static createChartReusability(){
		console.log("dd:"+SmartclideTdReusabilityTheiaWidget.stateReusability.data.length);
		//remove previous
			am4core.disposeAllCharts();
			(document.getElementById('chartReusability') as HTMLElement).innerHTML= '';

			//create
			am4core.useTheme(am4themes_animated);
			let chart = am4core.create("chartReusability", am4charts.XYChart);
			chart.data = SmartclideTdReusabilityTheiaWidget.stateReusability.data;

			// Create axes
			let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
			categoryAxis.dataFields.category = "revisionCount";
			var valueAxisY = chart.yAxes.push(new am4charts.ValueAxis());

			// Create series
			let series = chart.series.push(new am4charts.LineSeries());
			series.stroke = am4core.color("#7973ff");
			series.strokeWidth = 2;
			series.dataFields.valueY = 'index';
			series.dataFields.categoryX = 'revisionCount';
			series.minBulletDistance = 10;
			series.tooltipText = "{valueY}";
		
			// Configure grid
			valueAxisY.renderer.grid.template.strokeOpacity = 1;
			valueAxisY.renderer.grid.template.stroke = am4core.color("#666666");
			valueAxisY.renderer.grid.template.strokeWidth = 1;
			categoryAxis.renderer.grid.template.strokeOpacity = 1;
			categoryAxis.renderer.grid.template.stroke = am4core.color("#666666");
			categoryAxis.renderer.grid.template.strokeWidth = 1;

			// Configure labels
			valueAxisY.renderer.labels.template.fill = am4core.color("#666666");
			categoryAxis.renderer.labels.template.fill = am4core.color("#666666");

			//customatize scrollbar
			chart.scrollbarX = new am4core.Scrollbar();
			chart.scrollbarX.minHeight=10;
			SmartclideTdReusabilityTheiaWidget.customizeGrip(chart.scrollbarX.startGrip);
			SmartclideTdReusabilityTheiaWidget.customizeGrip(chart.scrollbarX.endGrip);

			//zoom out button
			chart.zoomOutButton.align = "left";
			chart.zoomOutButton.valign = "top";
			chart.zoomOutButton.marginLeft = 10;
			chart.zoomOutButton.marginTop = 10;

			// Add cursor
			chart.cursor = new am4charts.XYCursor();
			chart.cursor.xAxis = categoryAxis;
			chart.cursor.snapToSeries = series;
		
	}

	// Style scrollbar
	static customizeGrip(grip: any) {
		// Remove default grip image
		grip.icon.disabled = true;
		// Disable background
		grip.background.disabled = true;
		
		// Add rotated rectangle as bi-di arrow
		var img = grip.createChild(am4core.Rectangle);
		img.width = 5;
		img.height = 5;
		img.fill = am4core.color("#999");
		img.rotation = 45;
		img.align = "center";
		img.valign = "middle";
		
		// Add vertical bar
		var line = grip.createChild(am4core.Rectangle);
		line.height = 20;
		line.width = 3;
		line.fill = am4core.color("#999");
		line.align = "center";
		line.valign = "middle";
	}
}