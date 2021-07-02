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
	
	const {seasons, cellHeight, handleDateRowChange, sdk, handleDateChange, enabled} = dateTableArgs;
	const maxDateRows = seasons[seasonId].dates.length;
	const tableHeight = (maxDateRows+2)*cellHeight;
	return (
		<div>
			<Select
				value={maxDateRows}
				onChange={(change) => {handleDateRowChange({sdk, change, seasonId})}}
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
							{...dateColumn, readOnly: (enabled === false)}, 
							{...dateColumn, readOnly: (enabled === false)}
					]}
					height={tableHeight}
					afterChange={(change) => {handleDateChange({change, sdk, seasonId})}}
				/>
			</div>
		</div>				
	);
};

const GetPricingTable = ({seasonId, priceType, priceTableArgs}) => {
	
	const {seasons, maxPriceRows, colHeaders, columns, handlePriceChange, sdk, enabled} = priceTableArgs;
	const tableHeight = (maxPriceRows+2)*cellHeight;
	
	return (
		<div style={{height: tableHeight}}>
			<HotTable
				licenseKey={'non-commercial-and-evaluation'}
				data={seasons[seasonId][priceType]} 
				maxRows={maxPriceRows}
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
				height={(maxPriceRows+2)*cellHeight}
				afterChange={change => {handlePriceChange({change, sdk, seasonId, priceType})}}
			/>
		</div>	
	);
};

export const RenderHotTable = ({sdk, seasons, maxPriceRows, colHeaders, columns, enabled, selectedSeasonTab, handlePriceChange, handleDateRowChange, handleDateChange, handleSeasonAccordion, handleSeasonRename}) => {

	const priceTableArgs = {seasons, maxPriceRows, colHeaders, columns, handlePriceChange, sdk, enabled};
	const dateTableArgs = {seasons, cellHeight, handleDateRowChange, sdk, handleDateChange, enabled};
	
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
				<div 
					style={accordionStyle}
					onClick={() => {handleSeasonAccordion({sdk, change: k})}}
					htmlFor={k} >
					{getIcon()}
				</div>
				{selectedSeasonTab === k ? (
					<div id={k} style={{marginTop: '20px', marginBottom: '20px'}}>	
						<SectionHeading>{'Rename Season'}</SectionHeading>
						<br/>
						<TextInput
							id={`rename_season_${k}`}
							isReadOnly={enabled === false}
							value={k !== seasonName && seasonName ? seasonName : ''}
							onBlur={change =>{handleSeasonRename({change, sdk, seasonId: k})}}
						/>

						<br/>
						<br/>
						{k !== 'season_1' ? 
							<>
							<SectionHeading>{'Number of Dates'}</SectionHeading>
							<br/>
							<GetDateTable seasonId={k} dateTableArgs={dateTableArgs}/>
							<br/>
							</>
							: ''
						}
						<SectionHeading>{'Fixed Price'}</SectionHeading>
						<br/>
						<GetPricingTable seasonId={k} priceType={'fixed'} priceTableArgs={priceTableArgs}/>
						<br/>
						<SectionHeading>{'Variable Price'}</SectionHeading>
						<br/>
						<GetPricingTable seasonId={k} priceType={'dynamic'} priceTableArgs={priceTableArgs} />
					</div>
				) : ''}
			</div>
		);
	});
	
	return (
		<>{output}</>
	);
};