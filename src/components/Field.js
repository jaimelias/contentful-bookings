import React from 'react';
import { SelectField, Option, Button } from '@contentful/forma-36-react-components';
import { HotTable } from '@handsontable/react';
import '@contentful/forma-36-react-components/dist/styles.css';
import 'handsontable/dist/handsontable.full.css';

const isNumber = val => !isNaN(Number(val));

const defaultState = {
	maxRows: 20,
	data: [...Array(20)].map(r => [null]),
	childrenFreeUpTo: 0,
	childrenDiscount: 0,
	womenPricing: 0,
}

class Field extends React.Component {
	constructor(props){
		super(props);
		const {sdk} = props;
		const value = sdk.field.getValue();
		this.colHeaders = ['Per Person'];
		this.state = (value) ? value : defaultState;
		this.handleCellChange = this.handleCellChange.bind(this);
		this.handleRowChange = this.handleRowChange.bind(this);
		this.handleVariablePricing = this.handleVariablePricing.bind(this);
	};
	componentDidMount()
	{
		const {sdk} = this.props;
		
		console.log({sdk});
		
		if(window.innerHeight < this.divRef.clientHeight)
		{
			sdk.window.updateHeight(this.divRef.clientHeight);
		}
		else
		{
			sdk.window.updateHeight();
		}
	};
	componentDidUpdate()
	{
		const {sdk} = this.props;
		
		if(window.innerHeight < this.divRef.clientHeight)
		{
			sdk.window.updateHeight(this.divRef.clientHeight);
		}
		else
		{
			sdk.window.updateHeight();
		}
	};	
	handleCellChange({changes, sdk, hot}){
		
		const value = {...this.state};
		let {data} = value;
		
		if(changes)
		{
			if(Array.isArray(changes))
			{
				changes.forEach(o => {
					
					const [row, col, oldValue, newValue] = o;
					
					
					if(oldValue !== newValue && !isNaN(oldValue) && !isNaN(newValue))
					{
						data[row][col] = newValue;
					}
					else
					{
						data[row][col] = null;
					}
				});
																
				sdk.field.setValue({...this.state, data}).then(v => {
					this.setState({...v});
					console.log(v);
				});
			}
		}
	};

	handleRowChange({changes, sdk}){
		
		const value = {...this.state};
		let {data} = value;
		const newMaxRows = parseInt(changes.target.value);
		const oldmaxRows = parseInt(value.maxRows);
		
		if(oldmaxRows !== newMaxRows)
		{
			data = data.filter((r, i) => (i+1) <= newMaxRows);
			
			if(newMaxRows > oldmaxRows)
			{
				const dif = newMaxRows-oldmaxRows;				
				[...Array(dif)].forEach(r => data.push([null]));
			}
			
			sdk.field.setValue({...this.state, data, maxRows: newMaxRows}).then(v => {
				this.setState({...v});
				console.log(v);
			});
		}
	};
	handleClearValue({sdk}){
				
		sdk.field.setValue({...defaultState}).then(v => {
			this.setState({...v});
			console.log(v);
		});
	};
	handleVariablePricing({sdk, type, change}){
				
		change = parseInt(change.target.value);
		change = isNumber(change) ? change : 0;
		
		sdk.field.setValue({...this.state, [type]: change}).then(v => {
			this.setState({...v});
			console.log(v);
		});		
	};
	render(){
		const {sdk} = this.props;
		const {data, maxRows, childrenFreeUpTo, childrenDiscount, womenPricing} = this.state;
		
		return(
		
			<div
				ref={element => this.divRef = element}
				id={'hot-app'} >
				
				<Button onClick={()=>{this.handleClearValue({sdk})}} buttonType={'muted'}>Clear Field</Button>
				
				<SelectField
					value={childrenFreeUpTo}
					labelText={'Children free up to # (years old)'} 
					onChange={(change) => {this.handleVariablePricing({sdk, type: 'childrenFreeUpTo', change})}}>
					{[...Array(18)].map((r, i) => <Option key={i} value={i}>{i}</Option>)}
				</SelectField>
				
				<SelectField
					value={childrenDiscount}
					labelText={'Children discount up to # (years old)'} 
					onChange={(change) => {this.handleVariablePricing({sdk, type: 'childrenDiscount', change})}}>
					{[...Array(18)].map((r, i) => <Option key={i} value={i}>{i}</Option>)}
				</SelectField>
				
				<SelectField
					value={womenPricing}
					labelText={'Women Pricing'} 
					onChange={(change) => {this.handleVariablePricing({sdk, type: 'womenPricing', change})}}>
					<Option value={0}>{'Regular Rate'}</Option>
					<Option value={1}>{'Grant Discount'}</Option>
					<Option value={2}>{'Free of Cost'}</Option>
				</SelectField>				
				
				<SelectField
					value={maxRows}
					labelText="Maximum Number of Prices Per Person" 
					onChange={(changes)=>{this.handleRowChange({changes, sdk})}}>
					{[...Array(20)].map((r, i) => <Option key={i} value={i+1}>{i+1}</Option>)}
				</SelectField>
				
				<div className={'hot-container'}>
				<HotTable
					licenseKey={'non-commercial-and-evaluation'}
					data={data} 
					maxRows={maxRows}
					colHeaders={this.colHeaders}
					rowHeaders={true}
					columns={[{type: 'numeric'}]}
					width={'100%'}
					afterChange={(changes)=> {this.handleCellChange({changes, sdk})}}
				/>
				</div>
				
			</div>	
		);
	}; 
};

export default Field;