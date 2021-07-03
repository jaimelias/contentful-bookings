import React from 'react';
import {Switch, FormLabel} from '@contentful/forma-36-react-components';

const switchStyle = {
	paddingTop: '20px', 
	paddingRight: '20px', 
	paddingBottom: '10px', 
	paddingLeft: '20px', 
	border: 'solid 1px #dddddd'
};


export const RenderSwitch = ({label, type, status, sdk, handleSwitch}) => {
	label = label + ' ';
	label += (status) ? 'Enabled' : 'Disabled';
	
	return (
		<div style={switchStyle}>
			<FormLabel htmlFor={type}>
				<Switch
					id={type}
					isChecked={status} 
					labelText={label}
					onToggle={(change) => {handleSwitch({type, sdk, change})}}
				/>
			</FormLabel>
		</div>
	);
}


