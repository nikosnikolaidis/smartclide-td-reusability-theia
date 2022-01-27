import * as React from 'react';
import { VictoryChart, VictoryLine, VictoryZoomContainer, VictoryTheme } from 'victory';

interface Props {
	data: { x: number; y: number; }[]
}

export class Chart extends React.Component<Props> {
    static zoomDomain: { x:[number,number] }

	handleZoom(domain : {x:[number,number]}) {
		Chart.zoomDomain= domain;
	}

    constructor(props: Props){
        super(props);
    }

    render() {
		Chart.zoomDomain={x:[1,this.props.data.length]};
    
		return <div>
			<VictoryChart theme={VictoryTheme.material} width={400}
				containerComponent={
					<VictoryZoomContainer responsive={true}
						zoomDimension="x"
						zoomDomain={Chart.zoomDomain}
						onZoomDomainChange={this.handleZoom.bind(this)}
					/>
				}>
					<VictoryLine data={this.props.data}
						//labels={({ datum }) => datum.y}
						//labelComponent={<VictoryLabel renderInPortal dy={-20}/>}
						style={{ data: { stroke: "#4367a2"}}}
					/>
					
			</VictoryChart>
		</div>
    }
  }

  export default Chart;