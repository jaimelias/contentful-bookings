import React from 'react';
import {Select, Option, Switch, FormLabel} from '@contentful/forma-36-react-components';

const switchStyle = {
	paddingTop: '20px', 
	paddingRight: '20px', 
	paddingBottom: '10px', 
	paddingLeft: '20px', 
	border: 'solid 1px #dddddd',
	marginBottom: '1.5rem'
};

const selectStyle = {
	marginBottom: '1.5rem'
};

const childStyle = {
	borderLeft: 'solid 3px #cccccc',
	marginLeft: '20px'
};

export const RenderSelect = ({label, value, name, arr, min, handler, isNumeric, enabled, isChild}) => {
	
	const thisStyle = (isChild) ? {...selectStyle, ...childStyle, paddingLeft: '20px'}  : selectStyle;
	
	return (<>
		<div style={thisStyle}>
			<FormLabel htmlFor={'durationUnit'}>
				{label}
			</FormLabel>
			<Select
				id={name}
				value={value}
				isDisabled={enabled === false}
				onChange={(change) => {handler({change, stateProp: name, isNumeric, isSwitch: false})}}>
				{arr.map((r, i) => {

					let v;
					let t;
					
					if(typeof r === 'object')
					{								
						if(r.hasOwnProperty('value'))
						{
							v = r.value;
						}
						if(r.hasOwnProperty('text'))
						{
							t = r.text;
						}
					}
					else
					{
						if(isNumeric)
						{
							v = i+min;
							t = v;
						}
						else
						{
							v = r;
							t = r;
						}
					}
					
					return <Option key={v} value={v}>{t}</Option>;
				})}
			</Select>
		</div>
	</>);
};

export const RenderSwitch = ({label, stateProp, value, handler, isChild}) => {
	label = label + ' ';
	label += (value) ? 'Enabled' : 'Disabled';
	
	const thisStyle = (isChild) ? {...switchStyle, ...childStyle}  : switchStyle;

	return (
		<div style={thisStyle}>
			<FormLabel htmlFor={stateProp}>
				<Switch
					id={stateProp}
					isChecked={value} 
					labelText={label}
					onToggle={(change) => {handler({stateProp, change, isSwitch: true})}}
				/>
			</FormLabel>
		</div>
	);
}


