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
	colHeaders: ['Per Person'],
	columns: [{type: 'numeric'}]
}

class Field extends React.Component {
	constructor(props){
		super(props);
		const {sdk} = props;
		const value = sdk.field.getValue();
		this.state = (value) ? value : defaultState;
		this.handleCellChange = this.handleCellChange.bind(this);
		this.handleRowChange = this.handleRowChange.bind(this);
		this.handleVariablePricing = this.handleVariablePricing.bind(this);
	};
	componentDidMount()
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
		
		let {data} = {...this.state};
		
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
		
		let {data, maxRows} = {...this.state};
		const newMaxRows = parseInt(changes.target.value);
		const oldmaxRows = parseInt(maxRows);
		
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
			const {childrenDiscount, womenPricing} = v;
			const data = [];
			let addNull = 1;

			let cols = {
				colHeaders: {
					persons: 'Per Person',
					womenPricing: 'Women Discount',
					childrenDiscount: 'Children Discount'
				},
				columns: {
					persons: {type: 'numeric'},
					womenPricing: {type: 'numeric'},
					childrenDiscount: {type: 'numeric'}
				},				
			};
			
			if(womenPricing === 1)
			{
				addNull++;
			}
			else
			{
				delete cols.colHeaders.womenPricing;
				delete cols.columns.womenPricing;
			}

			
			if(childrenDiscount > 0)
			{
				addNull++;			
			}
			else
			{
				delete cols.colHeaders.childrenDiscount;
				delete cols.columns.childrenDiscount;
			}
			
			const colHeaders = Object.values(cols.colHeaders);
			const columns = Object.values(cols.columns);

			v.data.forEach(r => {
				let d = r.filter((r, i) => (i+1) <= addNull);
				
				if(addNull > d.length)
				{
					const dif = addNull-d.length;				
					[...Array(dif)].forEach(r => d.push(null));					
				}
				data.push(d);
			});
			
			sdk.field.setValue({...v, data, colHeaders, columns}).then(v2 => {
				this.setState({...v2});
				console.log(this.state);
			});
		});		
	};
	render(){
		const {sdk} = this.props;
		const {data, maxRows, childrenFreeUpTo, childrenDiscount, womenPricing, colHeaders, columns} = this.state;
				
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
					colHeaders={colHeaders}
					rowHeaders={true}
					columns={columns}
					width={'100%'}
					afterChange={(changes)=> {this.handleCellChange({changes, sdk})}}
				/>
				</div>
				
			</div>	
		);
	}; 
};

export default Field;