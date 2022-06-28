/*******************************************************************************
 * Copyright (C) 2021-2022 UoM - University of Macedonia
 * 
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 * 
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/
import * as React from 'react';
import { VictoryChart, VictoryLine, VictoryTheme, VictoryZoomContainer } from 'victory';

interface Props {
	data: { x: number; y: number; }[]
}
interface IState{
	zoomDomain: { x:[number,number] }
}

export class Chart extends React.Component<Props,IState> {

	handleZoom(domain: any ){
		this.setState({ zoomDomain: domain });
	}

    constructor(props: Props){
        super(props);

		this.state = {
			zoomDomain: {x:[1,this.props.data.length]}
		};
    }

    render() {
		return <div>
			<VictoryChart theme={VictoryTheme.material} height={400} width={500}
				containerComponent={
					<VictoryZoomContainer responsive={false}
						zoomDimension="x"
						zoomDomain={this.state.zoomDomain}
						onZoomDomainChange={this.handleZoom.bind(this)}
					/>
				}>
					<VictoryLine data={this.props.data}
						style={{ data: { stroke: "#4367a2"}}}
					/>
			</VictoryChart>
		</div>
    }
  }

  export default Chart;
