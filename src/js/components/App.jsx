
import styles from 'css/App.css';

import Icon from './Icon.jsx';
import React from 'react';
import WeatherWidget from './WeatherWidget.jsx';

class App extends React.PureComponent {
	constructor (props) {
		super(props);
		this.doAddItem = this.addItem.bind(this);
		this.state = {};
		this.state.nextWidgetId = 2;
		this.state.widgetIDs = [1];
	}
	
	addItem () {
		this.setState({
			widgetIDs: [].concat(this.state.widgetIDs).concat(this.state.nextWidgetId++)
		});
	}
	
	removeItem (id) {
		const newList = this.state.widgetIDs.concat();
		const index = newList.indexOf(id);
		if (!~index) return;
		newList.splice(index, 1);
		this.setState({
			widgetIDs: newList
		});
	}
	
	render () {
		return (
			<div className="App">
				<h1>Weather app</h1>
				{this.renderWidgets()}
				<button onClick={this.doAddItem}><Icon>add</Icon></button>
			</div>
		);
	}
	
	renderWidgets () {
		const list = [];
		for (var i = 0; i < this.state.widgetIDs.length; i++) {
			const id = this.state.widgetIDs[i];
			list.push(<WeatherWidget key={id} onRemove={_ => this.removeItem(id)}/>);
		}
		return list;
	}
}
window.App = App;

export default App;
