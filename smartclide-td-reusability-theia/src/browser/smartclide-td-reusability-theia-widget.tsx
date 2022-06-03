/**
 * @license
 * Copyright (C) 2021 UoM - University of Macedonia
 * 
 * This program and the accompanying materials are made available under the 
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0/
 * 
 * SPDX-License-Identifier: EPL-2.0
 */

import * as React from 'react';
import { injectable, postConstruct, inject } from 'inversify';
import { AlertMessage } from '@theia/core/lib/browser/widgets/alert-message';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core';
import { Interest} from './interest';
import { Principal} from './principal';
import { Reusability} from './reusability';
import Chart from './chart';
import ReactDOM = require('react-dom');


@injectable()
export class SmartclideTdReusabilityTheiaWidget extends ReactWidget {

    static readonly ID = 'smartclide-td-reusability-theia:widget';
    static readonly LABEL = 'Smartclide TD and Reusability';
	
	static state = {
		PrincipalServiceURL: '',
		PrincipalProjectURL: '',
		InterestServiceURL: '',
		InterestProjectURL: '',
		InterestProjectHasToken: '',
		InterestProjectToken: '',
		PrincipalProjectToken: '',
		PrincipalSonarQubeProjectKey: '',
		InterestFileNumber: '',
		ReusabilityServiceURL: '',
		ReusabilityProjectURL: '',
		stateKeycloakToken: ''
	}
	
	static statePrincipalEndpoints=[{fileName: '', endpointMethod: ''}]
	
	static stateInterest ={
		data: [{ x: 0, y: 0 }]
	}
	
	static stateReusability ={
		data: [{ x: 0, y: 0 }]
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

        return <div id='widget-container-TDReusability'>
			<ul>
				<li><span id='menuPrincipal' className='active' onClick={_a => this.clickMenu('menuPrincipal','td-principal')}>TD Principal</span></li>
				<li><span id='menuInterest' onClick={_a => this.clickMenu('menuInterest','td-interest')}>TD Interest</span></li>
				<li><span id='menuReusability' onClick={_a => this.clickMenu('menuReusability','reusability')}>Reusability</span></li>
			</ul>
			<div id='td-principal'>
				<AlertMessage type='INFO' header={header} />
				<input onChange={this.updateInput} placeholder='Principal Service URL' name='PrincipalServiceURL'/>
				<input onChange={this.updateInput} placeholder='Project URL' name='PrincipalProjectURL'/>
				<input id='principalSonarQubeProjectKey' onChange={this.updateInput} placeholder='SonarQube Project Key' name='PrincipalSonarQubeProjectKey'/>
				<label className='checkboxLabel'>
					<input type="checkbox" onChange={this.onCheckBoxChangePrincipalPrivate}/>Is private
				</label>
				<input id='principalProjectToken' style={{display:"none"}} onChange={this.updateInput} placeholder='Git Token' name='PrincipalProjectToken'/>
				<label className='checkboxLabel'>
					<input type="checkbox" onChange={this.onCheckBoxChangePrincipalManualEndpoints}/>Add endpoints manually
				</label>
				<div id='listManualEndpoints'>
					<button className='addNewEndpoint' onClick={_a => this.addEnpoint()} style={{marginLeft:"20px"}}>Add</button>
					<ul id='listEndpoints'>
						<li>
							<input placeholder='File Name' className='fileName'/>
							<input placeholder='Endpoint Method' className='endpointMethod'/>
						</li>
					</ul>
				</div>
				<button className='theia-button secondary' title='New Analysis' onClick={_a => principalInstance.runprocessNewAnalysis(this.messageService)} style={{display:"block", marginTop:"5px", marginBottom:"5px",}}>New Analysis</button>
				<button className='theia-button secondary' title='Load Last Analysis' onClick={_a => principalInstance.runprocessGetMetrics(this.messageService)}>Project Analysis</button>
				<button className='theia-button secondary' title='Enpoint Analysis' onClick={_a => principalInstance.runprocessGetMetricsEndpoint(this.messageService)}>Enpoint Analysis</button>
				<div id='waitAnimation' className="lds-dual-ring"></div>
				<div id='TdProjectResults'>
					<p id='TDIndex' style={{marginLeft:'10px', display:'block'}}></p>
					<p id='issuesNumber' style={{marginLeft:'10px', marginBottom:'auto', display:'block'}}></p>
					<div id='issues' style={{marginLeft:'10px'}}></div>
				</div>
				<ul id='endpointResultsList'>
				</ul>
			</div>
			<div id='td-interest'>
				<AlertMessage type='INFO' header={header2} />
				<input onChange={this.updateInput} placeholder='Interest Service URL' name='InterestServiceURL'/>
				<input onChange={this.updateInput} placeholder='Project URL' name='InterestProjectURL'/>
				<label className='checkboxLabel'>
					<input type="checkbox" onChange={this.onCheckBoxChange}/>Is private (for new analysis)
				</label>
				<input id='interestProjectToken' onChange={this.updateInput} placeholder='Project Token' name='InterestProjectToken'/>
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


	protected addEnpoint(): void {
		let listEndpoints = document.getElementById('listEndpoints');
		let listLi = document.createElement("li");
		let liInput1 = document.createElement("input");
		liInput1.className = 'fileName';
		liInput1.placeholder= 'File Name';
		liInput1.style.width= '50%';
		listLi.appendChild(liInput1);
		let removeB = document.createElement('button');
		var removeButtonText = document.createTextNode("-");
		removeB.appendChild(removeButtonText);
		removeB.addEventListener('click', (e:Event) => {
			var temp= (e.target as HTMLElement).parentElement as HTMLElement;
			temp.remove();
		});
		listLi.appendChild(removeB);
		let liInput2 = document.createElement("input");
		liInput2.className = 'endpointMethod';
		liInput2.placeholder= 'Endpoint Method';
		listLi.appendChild(liInput2);
		listEndpoints?.appendChild(listLi);
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

	//update the state for checkbox
	onCheckBoxChange(e: React.ChangeEvent<HTMLInputElement>) {
		if(e.target.checked){
			(document.getElementById("interestProjectToken") as HTMLElement).style.display = "block";
			SmartclideTdReusabilityTheiaWidget.state.InterestProjectHasToken= 'yes';
		}
		else{
			(document.getElementById("interestProjectToken") as HTMLElement).style.display = "none";
			SmartclideTdReusabilityTheiaWidget.state.InterestProjectHasToken= 'no';
		}
	 }

	 //update the state for checkbox
	 onCheckBoxChangePrincipalManualEndpoints(e: React.ChangeEvent<HTMLInputElement>) {
		if(e.target.checked){
			(document.getElementById("listManualEndpoints") as HTMLElement).style.display = "block";
		}
		else{
			(document.getElementById("listManualEndpoints") as HTMLElement).style.display = "none";
		}
	 }

	 //update visibility of Token field
	 onCheckBoxChangePrincipalPrivate(e: React.ChangeEvent<HTMLInputElement>) {
		if(e.target.checked){
			(document.getElementById("principalProjectToken") as HTMLElement).style.display = "block";
		}
		else{
			(document.getElementById("principalProjectToken") as HTMLElement).style.display = "none";
		}
	 }



	//create chart Interest
	static createChartInterest():void{
		var chart= <Chart data={SmartclideTdReusabilityTheiaWidget.stateInterest.data} />;
		ReactDOM.render(chart, document.getElementById("chartInterest"));
	}

	//create chart Reusability
	static createChartReusability(){
		var chart= <Chart data={SmartclideTdReusabilityTheiaWidget.stateReusability.data} />;
		ReactDOM.render(chart, document.getElementById("chartReusability"));
	}
}