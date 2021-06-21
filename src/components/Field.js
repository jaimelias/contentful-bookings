import React from 'react';
import { SelectField, Option, Button, Heading, SectionHeading, Form, FieldGroup} from '@contentful/forma-36-react-components';
import { HotTable } from '@handsontable/react';
import '@contentful/forma-36-react-components/dist/styles.css';
import 'handsontable/dist/handsontable.full.css';
const priceKeys = ['fixed', 'dynamic']
const isNumber = val => !isNaN(Number(val));
const dateColumn = {validator: 'date', type: 'date', dateFormat: 'YYYY-MM-DD'};
const column = {type: 'numeric'};
const isValidDate = str => {
	const regEx = /^\d{4}-\d{2}-\d{2}$/;
	if(!str.match(regEx)) return false;  
	let d = new Date(str);
	const dNum = d.getTime();
	if(!dNum && dNum !== 0) return false;
	return d.toISOString().slice(0,10) === str;
}

const defaultState = {
	maxPriceRows: 2,
	seasons: {season_1: {
		fixed: [...Array(2)].map(r => ['']),
		dynamic: [...Array(2)].map(r => ['']),
		name: 'Default Prices',
		dates: [['', '']]
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
		this.handlePriceChange = this.handlePriceChange.bind(this);
		this.handlePriceRowChange = this.handlePriceRowChange.bind(this);
		this.handleVariablePricing = this.handleVariablePricing.bind(this);
		this.forceUpdateHeight = this.forceUpdateHeight.bind(this);
		this.handleSeasonsNumber = this.handleSeasonsNumber.bind(this);
		this.handleDateChange = this.handleDateChange.bind(this);
		this.handleDateRowChange = this.handleDateRowChange.bind(this);
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
	handleClearValue({sdk}){
				
		sdk.field.setValue({...defaultState}).then(v => {
			this.setState({...v});
			console.log(v);
		});
	};
	handleVariablePricing({sdk, type, change}){
		change = parseInt(change.target.value);
		change = isNumber(change) ? change : 0;
		let {childrenDiscount, womenPricing, seasons} = {...this.state};
		let addNull = false;

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
		
		if(womenPricing === 1 && type !== 'womenPricing')
		{
			addNull = true;
		}
		else
		{
			if(type === 'womenPricing' && change === 1)
			{
				addNull = true;
			}
			else
			{
				delete cols.colHeaders.womenPricing;
				delete cols.columns.womenPricing;				
			}
		}

		
		if(childrenDiscount > 0 && type !== 'childrenDiscount')
		{
			addNull = true;	
		}
		else
		{
			if(type === 'childrenDiscount' && change > 0)
			{
				addNull = true;
			}
			else
			{
				delete cols.colHeaders.childrenDiscount;
				delete cols.columns.childrenDiscount;				
			}
		}
		
		const colHeaders = Object.values(cols.colHeaders);
		const columns = Object.values(cols.columns);
				
		for(let s in seasons)
		{
			for(let t in seasons[s])
			{
				if(priceKeys.includes(t))
				{
					seasons[s][t].map(r => {
						
						if(addNull)
						{

							r.push('');
						}
						else
						{
							r.pop();
						}
						
						return r;
					});					
				}
			}
		}
		

		sdk.field.setValue({...this.state, seasons, colHeaders, columns, [type]: change}).then(v => {
			this.setState({...v});
			console.log(this.state);
		});
	
	};
	
	handleSeasonsNumber({change, sdk})
	{
		change = parseInt(change.target.value);
		let {seasons, maxPriceRows, womenPricing, childrenDiscount} = this.state;
		const countSeasons = Object.keys(seasons).length;
		let seasonRowTemplate = [''];
		
		if(womenPricing === 1)
		{
			seasonRowTemplate.push('');
		}
		if(childrenDiscount > 0)
		{
			seasonRowTemplate.push('');
		}
		
		
		const blankSeason = {
			fixed: [...Array(maxPriceRows)].map(r => seasonRowTemplate),
			dynamic: [...Array(maxPriceRows)].map(r => seasonRowTemplate),
			dates: [['', '']]
		};
		let startCounter = countSeasons + 1;
		let dif;
		
		if(change > countSeasons)
		{
			dif = change-countSeasons;			
			[...Array(dif)].forEach((r, i) => {
				const seasonName = 'seasons_' + (startCounter + i);
				seasons[seasonName] = {...blankSeason, name: seasonName};
			});			
		}
		else
		{
			dif = countSeasons-change;
			[...Array(countSeasons)].forEach((r, i) => {
				if((i+1) > (countSeasons-dif))
				{
					delete seasons['seasons_' + (i + 1)];
				}
			});			
		}
				
		sdk.field.setValue({...this.state, seasons, updateHeight: true}).then(v => {
			this.setState({...v});
			console.log(this.state);
		});
	};
	
	handlePriceChange({change, sdk, seasonId, priceType}){
		
		let {seasons} = {...this.state};
		
		if(change)
		{
			if(Array.isArray(change))
			{
				change.forEach(o => {
					
					const [row, col, oldValue, newValue] = o;

					if(oldValue !== newValue && !isNaN(newValue))
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
	
	handleDateChange({change, sdk, seasonId}){
		
		let {seasons} = {...this.state};
		
		if(change)
		{
			if(Array.isArray(change))
			{
				change.forEach(o => {
					
					const [row, col, oldValue, newValue] = o;

					if(oldValue !== newValue && isValidDate(newValue))
					{
						seasons[seasonId].dates[row][col] = newValue;
					}
					else
					{
						seasons[seasonId].dates[row][col] = '';
					}
				});
																
				sdk.field.setValue({...this.state, seasons}).then(v => {
					this.setState({...v});
					console.log(v);
				});
			}
		}		
	};
	handlePriceRowChange({change, sdk}){
		
		let {seasons, maxPriceRows, womenPricing, childrenDiscount} = {...this.state};
		const newMaxRows = parseInt(change.target.value);
		const oldmaxPriceRows = parseInt(maxPriceRows);
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
		
		if(oldmaxPriceRows !== newMaxRows)
		{
			for(let s in seasons)
			{
				for(let t in seasons[s])
				{	
					if(priceKeys.includes(t))
					{
						seasons[s][t] = seasons[s][t].filter((r, i) => (i+1) <= newMaxRows);
						
						if(newMaxRows > oldmaxPriceRows)
						{
							const dif = newMaxRows-oldmaxPriceRows;				
							[...Array(dif)].forEach(r => seasons[s][t].push(addNulls));
						}						
					}
				}
			}
			
			sdk.field.setValue({...this.state, seasons, maxPriceRows: newMaxRows, updateHeight: true}).then(v => {
				this.setState({...v});
				console.log(v);
			});
		}
	};	
	handleDateRowChange({sdk, seasonId, change}){
		let {seasons} = {...this.state};
		const newMaxRows = parseInt(change.target.value);
		const oldmaxPriceRows = parseInt(seasons[seasonId].dates.length);
		let addNulls = ['', ''];
				
		if(oldmaxPriceRows !== newMaxRows)
		{
			seasons[seasonId].dates = seasons[seasonId].dates.filter((r, i) => (i+1) <= newMaxRows);
			
			if(newMaxRows > oldmaxPriceRows)
			{
				const dif = newMaxRows-oldmaxPriceRows;				
				[...Array(dif)].forEach(r => seasons[seasonId].dates.push(addNulls));
			}				
		
			sdk.field.setValue({...this.state, seasons, updateHeight: true}).then(v => {
				this.setState({...v});
				console.log(v);
			});			
			
		}
	};
	render(){
		const {sdk} = this.props;
		const {seasons, maxPriceRows, childrenFreeUpTo, childrenDiscount, womenPricing, colHeaders, columns} = this.state;

		const RenderHotTable = ({sdk, seasons, maxPriceRows, colHeaders, columns}) => {
			let output = [];
			
			const GetTable = ({seasonId, priceType}) => (
				<HotTable
					licenseKey={'non-commercial-and-evaluation'}
					data={seasons[seasonId][priceType]} 
					maxRows={maxPriceRows}
					colHeaders={colHeaders}
					rowHeaders={true}
					columns={columns}
					width={'100%'}
					afterChange={(change)=> {this.handlePriceChange({change, sdk, seasonId, priceType})}}
				/>				
			);
			
			const GetDate = ({seasonId}) => (
				
				<div>
				
					<SelectField
						value={seasons[seasonId].dates.length}
						labelText={'Add Date Ranges'}
						onChange={(change) => {this.handleDateRowChange({sdk, change, seasonId})}}
						>
						{[...Array(20)].map((r, i) => <Option key={i} value={i+1}>{i+1}</Option>)}
					</SelectField>				
					<br/>
					<HotTable
						licenseKey={'non-commercial-and-evaluation'}
						data={seasons[seasonId].dates} 
						maxRows={seasons[seasonId].dates.length}
						colHeaders={['From', 'To']}
						rowHeaders={true}
						width={'100%'}
						placeholder={'yyyy-mm-dd'}
						columns={[dateColumn, dateColumn]}
						afterChange={(change) => {this.handleDateChange({change, sdk, seasonId})}}
					/>
				</div>
			);
						
			for(let k in seasons)
			{				
				output.push(
					<div title={k} key={k} style={{marginBottom: '40px'}}>
						<Heading>{k}</Heading>
						<br/>
						<SectionHeading>{'Dates'} - {k}</SectionHeading>
						<br/>
						<GetDate seasonId={k} />
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
							value={maxPriceRows}
							labelText="Maximum Number of Prices Per Person" 
							onChange={(change)=>{this.handlePriceRowChange({change, sdk})}}>
							{[...Array(20)].map((r, i) => <Option key={i} value={i+1}>{i+1}</Option>)}
						</SelectField>
						
						<SelectField
							value={Object.keys(seasons).length}
							labelText="Number of Seasons" 
							onChange={(change)=>{this.handleSeasonsNumber({change, sdk})}}>
							{[...Array(20)].map((r, i) => <Option key={i} value={i+1}>{i+1}</Option>)}
						</SelectField>						
					</FieldGroup>
					
					<RenderHotTable
						sdk={sdk}
						seasons={seasons}
						maxPriceRows={maxPriceRows} 
						colHeaders={colHeaders}
						columns={columns}
					/>
					
				</Form>
			</div>
		);
	}; 
};

export default Field;