import React from 'react';
import '@contentful/forma-36-react-components/dist/styles.css';
import 'handsontable/dist/handsontable.full.css';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';


class Field extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			maxRows: 10,
			colHeaders: ['Prices'],
			data: [...Array(10)].map(r => [null])
		};
		this.handleCellChange = this.handleCellChange.bind(this);
	};
	handleCellChange({changes, sdk, value, hot}){
				
		if(changes)
		{
			if(Array.isArray(changes))
			{
				changes.forEach(o => {
					
					const [row, col, oldValue, newValue] = o;
										
					if(oldValue !== newValue && !isNaN(oldValue) && !isNaN(newValue))
					{
						value.data[row][col] = newValue;
					}
					else
					{
						value.data[row][col] = null;
					}
				});
																
				sdk.field.setValue(value).then(v => console.log(v));
			}
		}
	};
	render(){
		const {sdk} = this.props;
		const value = sdk.field.getValue() || this.state
		const {colHeaders, data} = value;
		
		return(
		
			<div id={'hot-app'}>
				<HotTable
					licenseKey={'non-commercial-and-evaluation'}
					data={data} 
					colHeaders={colHeaders}
					rowHeaders={true}
					columns={[{type: 'numeric'}]}
					width={'600'}
					height={'300'}
					afterChange={(changes)=> {this.handleCellChange({changes, sdk, value})}}
				/>
			</div>	
		);
	};
};

export default Field;