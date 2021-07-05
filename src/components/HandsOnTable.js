import React from 'react';
import { HotTable } from '@handsontable/react';
import { Select, Option, SectionHeading, TextInput, Icon, Paragraph} from '@contentful/forma-36-react-components';
const dateColumn = {validator: 'date', type: 'date', dateFormat: 'YYYY-MM-DD'};
const cellHeight = 23;
const colWidths = 200;

const accordionStyle = {
	backgroundColor: '#eeeeee', 
	border: 'solid 1px #dddddd',
	padding: '10px',
	width: '100%',
	display: 'block',
	boxSizing: 'border-box',
	cursor: 'pointer'
};

const GetDateTable = ({seasonId, dateTableArgs}) => {
	
	const {seasons, cellHeight, handleDateRowChange, handleDateChange, enabled} = dateTableArgs;
	const maxDateRows = seasons[seasonId].dates.length;
	const tableHeight = (maxDateRows+2)*cellHeight;
	return (
		<div>
			<Select
				value={maxDateRows}
				onChange={(change) => {handleDateRowChange({change, seasonId})}}
				>
				{[...Array(20)].map((r, i) => <Option key={i} value={i+1}>{i+1}</Option>)}
			</Select>				
			<br/>
			<SectionHeading>{'Date Ranges'}</SectionHeading>
			<br/>
			<div style={{height: tableHeight}}>
				<HotTable
					licenseKey={'non-commercial-and-evaluation'}
					data={seasons[seasonId].dates} 
					maxRows={maxDateRows}
					colHeaders={['From', 'To']}
					rowHeaders={true}
					width={'100%'}
					colWidths={colWidths}
					placeholder={'yyyy-mm-dd'}
					columns={[
							{...dateColumn, data: 'from', readOnly: (enabled === false)}, 
							{...dateColumn, data: 'to', readOnly: (enabled === false)}
					]}
					height={tableHeight}
					afterChange={(change) => {handleDateChange({change, seasonId})}}
				/>
			</div>
		</div>				
	);
};

const GetPricingTable = ({seasonId, priceType, priceTableArgs}) => {
	
	const {seasons, maxParticipantsPerBooking, colHeaders, columns, handlePriceChange, enabled} = priceTableArgs;
	const tableHeight = (maxParticipantsPerBooking+2)*cellHeight;
	
	return (
		<div style={{height: tableHeight}}>
			<HotTable
				licenseKey={'non-commercial-and-evaluation'}
				data={seasons[seasonId][priceType]} 
				maxRows={maxParticipantsPerBooking}
				colHeaders={colHeaders}
				rowHeaders={true}
				columns={columns.map(r => {
					if(enabled === false)
					{
						r.readOnly = true;
					}
					return r;
				})}
				colWidths={colWidths}
				width={'100%'}
				height={(maxParticipantsPerBooking+2)*cellHeight}
				afterChange={change => {handlePriceChange({change, seasonId, priceType})}}
			/>
		</div>	
	);
};

export const RenderHotTable = ({seasons, maxParticipantsPerBooking, colHeaders, columns, enabled, variablePriceEnabled, selectedSeasonTab, handlePriceChange, handleDateRowChange, handleDateChange, handleSeasonAccordion, handleInput}) => {

	const priceTableArgs = {seasons, maxParticipantsPerBooking, colHeaders, columns, handlePriceChange, enabled};
	const dateTableArgs = {seasons, cellHeight, handleDateRowChange, handleDateChange, enabled};
	
	const countSeasons = Object.keys(seasons).length;
		
	const output = Object.keys(seasons).map(k => {
		const seasonName = seasons[k].name;
		
		const getIcon = () => {
			const i = (selectedSeasonTab === k) ? 'ChevronUp' : 'ChevronDown';
			const n = (seasonName.length > 0 && seasonName !== k) ? seasonName + ' - ' + k : k;
			return (
				<Paragraph>{n} <Icon icon={i} style={{'float': 'left', marginRight: '10px'}}/></Paragraph>
			);
		};
				
		return (
			<div key={k} style={{border: '1px solid #dddddd', padding: '10px', marginBottom: '20px'}}>
				
				{countSeasons > 1 ? <>
					<div 
						style={accordionStyle}
						onClick={() => {handleSeasonAccordion({change: k})}}
						htmlFor={k} >
						{getIcon()}
					</div>				
				</> : ''}
				
				{selectedSeasonTab === k || (k === 'season_1' && countSeasons === 1) ? (
					<div id={k} style={{marginTop: '20px', marginBottom: '20px'}}>	
					
						{countSeasons > 1 ? <>
							<SectionHeading>{'Rename Season'}</SectionHeading>
							<br/>
							<TextInput
								id={`rename_season_${k}`}
								isReadOnly={enabled === false}
								value={k !== seasonName && seasonName ? seasonName : ''}
								onChange={change =>{handleInput({change, type: k})}}
							/>
							<br/>
							<br/>							
						</> : ''}
					
						{k !== 'season_1' ? 
							<>
							<SectionHeading>{'Number of Dates'}</SectionHeading>
							<br/>
							<GetDateTable seasonId={k} dateTableArgs={dateTableArgs}/>
							<br/>
							</>
							: ''
						}
						<SectionHeading>{'Fixed Price Per Person'}</SectionHeading>
						<br/>
						<GetPricingTable seasonId={k} priceType={'fixedPrice'} priceTableArgs={priceTableArgs}/>
						{variablePriceEnabled 
						? <>
							<br/>
							<SectionHeading>{'Variable Price Per Person'}</SectionHeading>
							<br/>
							<GetPricingTable seasonId={k} priceType={'variablePrice'} priceTableArgs={priceTableArgs} />				
						</> 
						: ''}
					</div>
				) : ''}
			</div>
		);
	});
	
	return (
		<>{output}</>
	);
};