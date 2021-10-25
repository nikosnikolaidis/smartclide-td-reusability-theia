import { SmartclideTdReusabilityTheiaWidget } from './smartclide-td-reusability-theia-widget';
import { MessageService } from '@theia/core';


export class Principal {
    
    //Get metrics for TD principal
    runprocessGetMetrics(messageService: MessageService): void {
		//if field has value
		if(SmartclideTdReusabilityTheiaWidget.state.PrincipalServiceURL!=''){
			console.log('url: '+ SmartclideTdReusabilityTheiaWidget.state.PrincipalServiceURL);
			var temp= SmartclideTdReusabilityTheiaWidget.state.PrincipalProjectURL.replace('.git','').split('/');
			var projectName= temp[temp.length-1];
			//GET measures TD and number of issues
			fetch(SmartclideTdReusabilityTheiaWidget.state.PrincipalServiceURL+'/api/analysis/'+ projectName +'/measures', {mode: 'cors'})
				.then(res => res.json())
				.then((out) => {
					var obj= JSON.parse(JSON.stringify(out));
					var td=0;
					var issues=0;
					//get first metric
					if(obj[0].name == 'sqale_index')
						td= obj[0].value/60;
					else
						issues= obj[0].value;
					
					//get second metric
					if(obj[1].name == 'code_smells')
						issues= obj[1].value;
					else
						td= obj[1].value/60;
					
					console.log('td: '+td);
					console.log('issues: '+issues);
					
					//show TD and issues Number got from service
					(document.getElementById("TDIndex") as HTMLElement).style.display = "block";
					(document.getElementById('TDIndex') as HTMLElement).innerHTML = "TD Principal: "+ Math.round( td * 10 ) / 10 + "h / " + td*30 + "€";
					(document.getElementById("issuesNumber") as HTMLElement).style.display = "block";
					(document.getElementById('issuesNumber') as HTMLElement).innerHTML = "Issues: "+issues;
					
					//get Issues
					//var pages= Math.floor((issues-1)/500) + 1;
					//if(issues<10000){
					//	console.log(pages);
					//	for(let i=1; i<=pages; i++){
							this.runprocessGetIssues();//i);
					//	}
					//}
				})
				.catch(err => { 
					console.log('err: ', err);
					messageService.info('Error: '+err);
			});
		}
		else{
			messageService.info('Provide SonarQube URL');
			(document.getElementById("TDIndex") as HTMLElement).style.display = "none";
			(document.getElementById("issuesNumber") as HTMLElement).style.display = "none";
		}
	}

	//Get Issues for given page
	runprocessGetIssues():void{ //page: number): void {
		//console.log('page:::'+page);
		var temp= SmartclideTdReusabilityTheiaWidget.state.PrincipalProjectURL.replace('.git','').split('/');
		var projectName= temp[temp.length-1];

		//GET
		fetch(SmartclideTdReusabilityTheiaWidget.state.PrincipalServiceURL+'/api/analysis/'+ projectName +'/issues', {mode: 'cors'})
			.then(res => res.json())
			.then((out) => {
				var obj= JSON.parse(JSON.stringify(out));
				//console.log(obj.p);
				
				//crate HTMLElement for each issue
				for(let i of obj){
					var severity= i.issueSeverity;
					var message= i.issueName;
					//var debt= i.debt;
					var re = /(.*)[:]/;
					var component= i.issueDirectory.replace(re, "");
					
					let issuesDiv = document.getElementById('issues')!
					let divIssue = document.createElement("div");
					divIssue.className = 'divIssue';
					
					let nodeComponent = document.createElement("i");
					nodeComponent.appendChild(document.createTextNode(component));
					let nodeSeverity = document.createElement("span");
					nodeSeverity.appendChild(document.createTextNode(severity));
					let nodeMessage = document.createElement("p");
					nodeMessage.appendChild(document.createTextNode(message));
					
					divIssue.appendChild(nodeComponent);
					divIssue.appendChild(nodeSeverity);
					divIssue.appendChild(nodeMessage);
					issuesDiv.appendChild(divIssue);
				}
			})
			.catch(err => { 
				console.log('err: ', err);
		});
	}

}