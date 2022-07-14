/*******************************************************************************
 * Copyright (C) 2021-2022 UoM - University of Macedonia
 * 
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 * 
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/


import { SmartclideTdReusabilityTheiaWidget } from './smartclide-td-reusability-theia-widget';
import { MessageService } from '@theia/core';

interface projectReusabilityInfo {
    sha: string;
    revisionCount: number;
    index: number;
}

export class Reusability {
    
    //Get Reusability for chart
     runprocessLoadReusability(messageService: MessageService){

        //SmartclideTdReusabilityTheiaWidget.stateReusability.data = await Reusability.getAllReusabilityIndexes();
        //remove previous
		SmartclideTdReusabilityTheiaWidget.stateReusability.data=[];

        //call async for all indexes
        (async () => {
            try {
				var tempTable= await Reusability.getAllReusabilityIndexes<projectReusabilityInfo[]>();
				for(var temp1 of tempTable){
					SmartclideTdReusabilityTheiaWidget.stateReusability.data.push([temp1.revisionCount, temp1.index]);
				}
                //SmartclideTdReusabilityTheiaWidget.stateReusability.data = await Reusability.getAllReusabilityIndexes<projectReusabilityInfo[]>();
                SmartclideTdReusabilityTheiaWidget.createChartReusability();
            } catch(e) {}
        })()


        //Get only last commit index
        fetch(SmartclideTdReusabilityTheiaWidget.state.ReusabilityServiceURL+
                '/api/projectReusabilityIndexPerCommit?url='+SmartclideTdReusabilityTheiaWidget.state.ReusabilityProjectURL, 
				{
					mode: 'cors',
					headers: {
						'Authorization': 'Bearer ' + SmartclideTdReusabilityTheiaWidget.state.stateKeycloakToken
					}
				})
            .then(res => res.json())
            .then((out) => {
                var obj= JSON.parse(JSON.stringify(out));
                
                var lastSha= obj[obj.length-1].sha;
                var lastIndex= obj[obj.length-1].index;

                console.log('last sha: '+lastSha);
                (document.getElementById('reusability-buttons') as HTMLElement).style.display = "block";
                
                //show reusability of project of last commit
                (document.getElementById("indexReusability") as HTMLElement).style.display = "block";
                (document.getElementById('indexReusability') as HTMLElement).innerHTML = "Reusability Index: " + lastIndex .toFixed(4);
                


                //get Interest of files
                this.runprocessGetFiles(lastSha,10);
            })
            .catch(err => { 
                (document.getElementById("indexReusability") as HTMLElement).style.display = "none";
                messageService.info('Error: '+err);
                console.log('err: ', err);
        });
    }

    static async getAllReusabilityIndexes<T>(): Promise<T> {
        const response = await fetch(SmartclideTdReusabilityTheiaWidget.state.ReusabilityServiceURL+
            '/api/projectReusabilityIndexPerCommit?url='+SmartclideTdReusabilityTheiaWidget.state.ReusabilityProjectURL, 
			{
				mode: 'cors',
				headers: {
					'Authorization': 'Bearer ' + SmartclideTdReusabilityTheiaWidget.state.stateKeycloakToken
				}
			});
        const body = await response.json();
        console.log("All Reusability indexes fetched");
        return body;
    }

    //Get Reusability of Files
	runprocessGetFiles(sha: string, limit: number){
		fetch(SmartclideTdReusabilityTheiaWidget.state.ReusabilityServiceURL+
				'/api/reusabilityIndexByCommit?url='+SmartclideTdReusabilityTheiaWidget.state.ReusabilityProjectURL+'&sha='+sha+'&limit='+limit, 
					{
						mode: 'cors',
						headers: {
							'Authorization': 'Bearer ' + SmartclideTdReusabilityTheiaWidget.state.stateKeycloakToken
						}
					})
			.then(res => res.json())
			.then((out) => {
				var obj= JSON.parse(JSON.stringify(out));
				
				//crate HTMLElement for each file
				let filesDiv = document.getElementById('filesReusability')!
				filesDiv.innerHTML = '';
				for(let i of obj){
					var filePath= i.filePath;
					var reusabilityIndex= i.index;
					
					let divFile = document.createElement("div");
					divFile.className = 'divIssue';
					
					let nodeFile = document.createElement("i");
					nodeFile.appendChild(document.createTextNode(filePath));
					let nodeInterest = document.createElement("p");
					nodeInterest.innerHTML= reusabilityIndex;
					
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


    //show or hide Reusability of Files
	runprocessShowFiles(){
		var inner= (document.getElementById('reusability-ShowHideFiles') as HTMLElement).innerHTML;
		if (inner=='Show Files'){
			(document.getElementById('reusability-ShowHideFiles') as HTMLElement).innerHTML= 'Hide Files';
			(document.getElementById('filesReusability') as HTMLElement).style.display = "block";
		}
		else{
			(document.getElementById('reusability-ShowHideFiles') as HTMLElement).innerHTML= 'Show Files';
			(document.getElementById('filesReusability') as HTMLElement).style.display = "none";
		}
	}
	
	//show or hide Reusability Evolution Chart
	runprocessShowEvolution(){
		var inner= (document.getElementById('reusability-ShowHideChart') as HTMLElement).innerHTML;
		if (inner=='Show Evolution'){
			(document.getElementById('reusability-ShowHideChart') as HTMLElement).innerHTML= 'Hide Evolution';
			(document.getElementById('chartReusability') as HTMLElement).style.display = "block";
			SmartclideTdReusabilityTheiaWidget.createChartReusability();
		}
		else{
			(document.getElementById('reusability-ShowHideChart') as HTMLElement).innerHTML= 'Show Evolution';
			(document.getElementById('chartReusability') as HTMLElement).style.display = "none";
		}
	}
}
