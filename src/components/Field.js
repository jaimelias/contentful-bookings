import React from 'react';
import { SelectField, Option, Button } from '@contentful/forma-36-react-components';
import { HotTable } from '@handsontable/react';
import '@contentful/forma-36-react-components/dist/styles.css';
import 'handsontable/dist/handsontable.full.css';

const defaultState = {
	maxRows: 20,
	data: [...Array(20)].map(r => [null])
}

class Field extends React.Component {
	constructor(props){
		super(props);
		const {sdk} = props;
		const value = sdk.field.getValue();
		this.colHeaders = ['Prices Per Person'];
		this.state = (value) ? value : defaultState;
		this.handleCellChange = this.handleCellChange.bind(this);
		this.handleRowChange = this.handleRowChange.bind(this);
	};
	handleCellChange({changes, sdk, hot}){
		
		const value = this.state
		
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
																
				sdk.field.setValue(value).then(v => {
					this.setState({...v});
					console.log(v);
				});
			}
		}
	};
	handleRowChange({changes, sdk}){
		
		const value = this.state
		const newMaxRows = parseInt(changes.target.value);
		const oldmaxRows = parseInt(value.maxRows);
		
		if(oldmaxRows !== newMaxRows)
		{
			
			let data = value.data.filter((r, i) => (i+1) <= newMaxRows);
			
			if(newMaxRows > oldmaxRows)
			{
				const dif = newMaxRows-oldmaxRows;				
				[...Array(dif)].forEach(r => data.push([null]));
			}
			
			sdk.field.setValue({data, maxRows: newMaxRows}).then(v => {
				this.setState({...v});
				console.log(v);
			});
		}
	};
	handleClearValue({sdk}){
		sdk.field.setValue(defaultState).then(v => {
			this.setState({...v});
			console.log(v);
		});
	}
	render(){
		const {sdk} = this.props;
		const value = this.state
		const {data, maxRows} = value;
		
		return(
		
			<div id={'hot-app'} style={{height: '500px'}}>
				
				<Button onClick={()=>{this.handleClearValue({sdk})}} buttonType={'muted'}>Clear Field</Button>				
				
				<SelectField
					value={maxRows}
					labelText="Maximum Number of Prices Per Person" 
					onChange={(changes)=>{this.handleRowChange({changes, sdk})}}>
					{[...Array(20)].map((r, i) => <Option key={i} value={i+1}>{i+1}</Option>)}
				</SelectField>
				
				<HotTable
					licenseKey={'non-commercial-and-evaluation'}
					data={data} 
					maxRows={maxRows}
					colHeaders={this.colHeaders}
					rowHeaders={true}
					columns={[{type: 'numeric'}]}
					width={'600'}
					height={'300'}
					afterChange={(changes)=> {this.handleCellChange({changes, sdk})}}
				/>
				
			</div>	
		);
	}; 
};

export default Field;