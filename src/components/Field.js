import React from 'react';
import { SelectField, Option, Button, Heading, SectionHeading, Form, FieldGroup} from '@contentful/forma-36-react-components';
import { HotTable } from '@handsontable/react';
import '@contentful/forma-36-react-components/dist/styles.css';
import 'handsontable/dist/handsontable.full.css';

const isNumber = val => !isNaN(Number(val));
const column = {type: 'numeric'};
const defaultState = {
	maxRows: 2,
	seasons: {season_1: {
		fixed: [...Array(20)].map(r => ['']),
		dynamic: [...Array(20)].map(r => [''])
	}},
	childrenFreeUpTo: 0,
	childrenDiscount: 0,
	womenPricing: 0,
	colHeaders: ['Per Person'],
	columns: [column],
	updateHeight: false
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
		this.forceUpdateHeight = this.forceUpdateHeight.bind(this);
	};
	forceUpdateHeight({sdk, thisWindow, updateHeight}){
		if(updateHeight)
		{
			sdk.window.updateHeight(this.divRef.clientHeight);
			
			sdk.field.setValue({...this.state, updateHeight: false}).then(v => {
				this.setState({...v});
				console.log('height update to fit component');
			});
		}		
	};
	componentDidMount()
	{
		const {sdk} = this.props;
		this.forceUpdateHeight({sdk, updateHeight: true, thisWindow: window});
	};
	componentDidUpdate()
	{
		const {sdk} = this.props;
		const {updateHeight} = this.state;
		this.forceUpdateHeight({sdk, updateHeight, thisWindow: window});
	};	
	handleCellChange({changes, sdk, seasonId, priceType}){
		
		let {seasons} = {...this.state};
		
		if(changes)
		{
			if(Array.isArray(changes))
			{
				changes.forEach(o => {
					
					const [row, col, oldValue, newValue] = o;

					if(oldValue !== newValue && !isNaN(oldValue) && !isNaN(newValue))
					{
						seasons[seasonId][priceType][row][col] = newValue;
					}
					else
					{
						seasons[seasonId][priceType][row][col] = '';
					}
				});
																
				sdk.field.setValue({...this.state, seasons}).then(v => {
					this.setState({...v});
					console.log(v);
				});
			}
		}
	};

	handleRowChange({changes, sdk}){
		
		let {seasons, maxRows, womenPricing, childrenDiscount} = {...this.state};
		const newMaxRows = parseInt(changes.target.value);
		const oldmaxRows = parseInt(maxRows);
		let addNulls = [''];
		
		if(womenPricing === 1)
		{
			addNulls = ['', ''];
			
			if(childrenDiscount > 0)
			{
				addNulls = ['', '', ''];
			}
		}
		else
		{
			if(childrenDiscount > 0)
			{
				addNulls = ['', '', ''];
			}			
		}
		
		if(oldmaxRows !== newMaxRows)
		{
			for(let s in seasons)
			{
				for(let t in seasons[s])
				{					
					seasons[s][t] = seasons[s][t].filter((r, i) => (i+1) <= newMaxRows);
					
					if(newMaxRows > oldmaxRows)
					{
						const dif = newMaxRows-oldmaxRows;				
						[...Array(dif)].forEach(r => seasons[s][t].push(addNulls));
					}
				}
			}
			
			sdk.field.setValue({...this.state, seasons, maxRows: newMaxRows, updateHeight: true}).then(v => {
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
			let addNull = 1;

			let cols = {
				colHeaders: {
					persons: 'Per Person',
					womenPricing: 'Women Discount',
					childrenDiscount: 'Children Discount'
				},
				columns: {
					persons: column,
					womenPricing: column,
					childrenDiscount: column
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

			for(let s in v.seasons)
			{
				for(let t in v.seasons[s])
				{
					v.seasons[s][t].forEach(r => {
						let d = r.filter((r, i) => (i+1) <= addNull);
										
						if(addNull > d.length)
						{
							const dif = addNull-d.length;				
							[...Array(dif)].forEach(r => d.push(''));					
						}
						
						v.seasons[s][t].push(d);
					});					
				}
			}

			sdk.field.setValue({...v, seasons: v.seasons, colHeaders, columns}).then(v2 => {
				this.setState({...v2});
				console.log(this.state);
			});
		});		
	};
	
	
	render(){
		const {sdk} = this.props;
		const {seasons, maxRows, childrenFreeUpTo, childrenDiscount, womenPricing, colHeaders, columns} = this.state;
		
		const RenderHotTable = ({sdk, seasons, maxRows, colHeaders, columns}) => {
			let output = [];
			
			const GetTable = ({seasonId, priceType}) => {
				
				return (
					<HotTable
						licenseKey={'non-commercial-and-evaluation'}
						data={seasons[seasonId][priceType]} 
						maxRows={maxRows}
						colHeaders={colHeaders}
						rowHeaders={true}
						columns={columns}
						width={'100%'}
						afterChange={(changes)=> {this.handleCellChange({changes, sdk, seasonId, priceType})}}
					/>				
				);
			};
			
			for(let k in seasons)
			{
				output.push(
					<div id={k} key={k} className={'season-container'}>
						<Heading>{k}</Heading>
						<br/>
						<SectionHeading>{'Fixed Price'} - {k}</SectionHeading>
						<br/>
						<GetTable seasonId={k} priceType={'fixed'} />
						<br/>
						<SectionHeading>{'Variable Price'} - {k}</SectionHeading>
						<br/>
						<GetTable seasonId={k} priceType={'dynamic'} />
					</div>
				);
			}
			
			return output;
		};
				
		return(
			<div ref={element => this.divRef = element} id={'hot-app'}>
				<Form>
					
					<FieldGroup>
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
					</FieldGroup>
					
					<RenderHotTable
						sdk={sdk}
						seasons={seasons}
						maxRows={maxRows} 
						colHeaders={colHeaders}
						columns={columns}
					/>
					
				</Form>
			</div>
		);
	}; 
};

export default Field;