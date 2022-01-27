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

import { SmartclideTdReusabilityTheiaWidget } from './smartclide-td-reusability-theia-widget';
import { MessageService } from '@theia/core';

interface interestAnalysisReport {
    id: number;
    url: string;
    owner: string;
	repo: string;
}

export class Interest {
	//Get Interest for chart
	runprocessGetInterest(messageService: MessageService){
		//GET
		fetch(SmartclideTdReusabilityTheiaWidget.state.InterestServiceURL+
				'/api/cumulativeInterest?url='+SmartclideTdReusabilityTheiaWidget.state.InterestProjectURL
					, {mode: 'cors'})
			.then(res => res.json())
			.then((out) => {
				var obj= JSON.parse(JSON.stringify(out));
				//remove previous
				var lengthData= SmartclideTdReusabilityTheiaWidget.stateInterest.data.length;
				for(let count=0; count<lengthData; count++){
					SmartclideTdReusabilityTheiaWidget.stateInterest.data.pop();
				}
				
				//add interest to data for chart
				var tempInterest=0;
				var lastSha='';
				var tempInterestHours=0;
				for(let i of obj){
					tempInterest= i.interestEu;
					lastSha= i.sha;
					tempInterestHours= i.interestHours;
					SmartclideTdReusabilityTheiaWidget.stateInterest.data.push({x:i.revisionCount, y:i.interestEu});
				}
				console.log('last sha: '+lastSha);
				(document.getElementById('interest-buttons') as HTMLElement).style.display = "block";
				
				//show cumulative Interest of last commit
				(document.getElementById("TDIndexInterest") as HTMLElement).style.display = "block";
				(document.getElementById('TDIndexInterest') as HTMLElement).innerHTML = "TD Interest: "
							+ tempInterestHours + "h / " + tempInterest + "€";
				
				//get change with previous
				this.runprocessGetChange(lastSha);
				
				//get Interest of files
				this.runprocessGetFiles(lastSha,10);
			})
			.catch(err => { 
				(document.getElementById("TDIndexInterest") as HTMLElement).style.display = "none";
				messageService.info('Error: '+err);
				console.log('err: ', err);
		});
	}
	
	//Get change of Interest in last commit
	runprocessGetChange(sha: string){
		fetch(SmartclideTdReusabilityTheiaWidget.state.InterestServiceURL+
				'/api/interestChange?url='+SmartclideTdReusabilityTheiaWidget.state.InterestProjectURL
					+'&sha='+sha, {mode: 'cors'})
			.then(res => res.json())
			.then((out) => {
				var obj= JSON.parse(JSON.stringify(out));
				
				var innerH= (document.getElementById("TDIndexInterest") as HTMLElement).innerHTML;
				if(obj[0].changeEu<0){
					(document.getElementById("TDIndexInterest") as HTMLElement).innerHTML= innerH+
							'<span class="pic arrow-down"></span>';
				}
				else{
					(document.getElementById("TDIndexInterest") as HTMLElement).innerHTML= innerH+
							'<span class="pic arrow-up"></span>';
				}
			})
			.catch(err => { 
				console.log('err: ', err);
		});
	}
	
	//Get Interest of Files
	runprocessGetFiles(sha: string, limit: number){
		fetch(SmartclideTdReusabilityTheiaWidget.state.InterestServiceURL+
				'/api/highInterestFiles?url='+SmartclideTdReusabilityTheiaWidget.state.InterestProjectURL
					+'&sha='+sha+'&limit='+limit, {mode: 'cors'})
			.then(res => res.json())
			.then((out) => {
				var obj= JSON.parse(JSON.stringify(out));
				
				//crate HTMLElement for each file
				let filesDiv = document.getElementById('filesInterest')!
				filesDiv.innerHTML = '';
				for(let i of obj){
					var filePath= i.filePath;
					var interestEu= i.interestEu;
					var interestPercentageOfProject= Math.round( i.interestPercentageOfProject * 100 ) / 100;
					
					let divFile = document.createElement("div");
					divFile.className = 'divIssue';
					
					let nodeFile = document.createElement("i");
					nodeFile.appendChild(document.createTextNode(filePath));
					let nodeInterest = document.createElement("p");
					nodeInterest.innerHTML= interestEu+'€ &emsp; '+interestPercentageOfProject+'%';
					
					divFile.appendChild(nodeFile);
					divFile.appendChild(nodeInterest);
					filesDiv.appendChild(divFile);
				}
				
				//create HTMLElement button for showing more files
				let footerFiles = document.createElement("footer");
				let nodeSpan = document.createElement("span");
				nodeSpan.appendChild(document.createTextNode('Show More'));
				footerFiles.appendChild(nodeSpan);
				footerFiles.addEventListener("click", () => { this.runprocessGetFiles(sha,limit+10)});
				filesDiv.appendChild(footerFiles);
			})
			.catch(err => { 
				console.log('err: ', err);
		});
	}
	
	//Analyze Interest
	runprocessAnalyzeInterest(messageService: MessageService){
		let interestReport = { data: { } };

		//get data to send as body
		let data;
		if(SmartclideTdReusabilityTheiaWidget.state.InterestProjectHasToken=='no'){
			data={url: SmartclideTdReusabilityTheiaWidget.state.InterestProjectURL};
		}
		else{
			data={url: SmartclideTdReusabilityTheiaWidget.state.InterestProjectURL,
				  token: SmartclideTdReusabilityTheiaWidget.state.InterestProjectToken};
		}

		//async post and then get
		(async () => {
            try {
                interestReport.data = await Interest.postInteresAnalysis<interestAnalysisReport>(data);
				this.runprocessGetInterest(messageService);
            } catch(e) {}
        })()
	}

	//Send Analysis with or without token
	static async postInteresAnalysis<T>(data: { url: string; } | { url: string; token: string; }): Promise<T> {
		const response = await fetch(SmartclideTdReusabilityTheiaWidget.state.InterestServiceURL+
            '/api/startInterestAnalysis', { method: 'post',
			headers: {
				'Accept': '*/*',
				'Access-Control-Allow-Origin': '*',
				'Content-Type':  'application/json'
			},
			body: JSON.stringify(data)
		});
        const body = await response.json();
        console.log("Interest analysis finished");
        return body;
    }

	//show or hide Interest of Files
	runprocessShowFiles(){
		var inner= (document.getElementById('interest-ShowHideFiles') as HTMLElement).innerHTML;
		if (inner=='Show Files'){
			(document.getElementById('interest-ShowHideFiles') as HTMLElement).innerHTML= 'Hide Files';
			(document.getElementById('filesInterest') as HTMLElement).style.display = "block";
		}
		else{
			(document.getElementById('interest-ShowHideFiles') as HTMLElement).innerHTML= 'Show Files';
			(document.getElementById('filesInterest') as HTMLElement).style.display = "none";
		}
	}
	
	//show or hide Interest Evolution Chart
	runprocessShowEvolution(){
		var inner= (document.getElementById('interest-ShowHideChart') as HTMLElement).innerHTML;
		if (inner=='Show Evolution'){
			SmartclideTdReusabilityTheiaWidget.createChartInterest();
			(document.getElementById('interest-ShowHideChart') as HTMLElement).innerHTML= 'Hide Evolution';
			(document.getElementById('chartInterest') as HTMLElement).style.display = "block";
		}
		else{
			(document.getElementById('interest-ShowHideChart') as HTMLElement).innerHTML= 'Show Evolution';
			(document.getElementById('chartInterest') as HTMLElement).style.display = "none";
		}
	}
}