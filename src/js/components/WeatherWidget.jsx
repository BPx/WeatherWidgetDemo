
import styles from 'css/WeatherWidget.css';

import _ from 'lodash';
import Icon from './Icon.jsx';
import PropTypes from 'prop-types';
import React from 'react';

import ISO3166 from 'cached/ISO3166-2.json';

const UPDATE_INTERVAL = 1000 * 60;	// 1m for testing auto-update works

const countryCodeToName = {};
const countryNameToCode = {};
ISO3166.forEach(item => {
	countryCodeToName[item.Code] = item.Name;
	countryNameToCode[item.Name] = item.Code;
});


class Widget extends React.PureComponent {
	constructor (props) {
		super(props);
		this.doEdit = this.edit.bind(this);
		this.doSave = this.save.bind(this);
		this.doRefresh = this.refresh.bind(this);
		this.doRemove = this.remove.bind(this);
		this.state = {};
		this.state.city = this.props.city;
		this.state.country = this.props.country;
		this.state.editMode = false;
		this.state.locationFailed = false;
		this.state.tryingNewLocation = null;
		this.state.updating = false;
		this.interval = null;
	}
	
	componentDidMount () {
		this.refresh();
		this.interval = setInterval(_ => this.refresh(), UPDATE_INTERVAL);
	}
	
	componentDidUpdate (prevProps, prevState) {
		if (this.state.editMode && !prevState.editMode) {
			this.locationInput.focus();
		}
		if (this.state.data && prevState.data !== this.state.data && !_.isEqual(prevState.data, this.state.data)) {
			const data = this.state.data;
			// make sure we always show 0 on the chart
			const min = Math.min(_(data.averages).map(1).min(), _(data.ranges).map(1).min(), 0);
			Highcharts.chart(this.chartContainer, {
				credits: { enabled: false },
				legend: { enabled: false },
				title: { text: this.getLocation() },
				xAxis: { type: 'datetime' },
				yAxis: { title: { text: null }, min },
				tooltip: {
					crosshairs: true,
					shared: true,
					valueSuffix: '°C'
				},
				series: [{
					name: 'Temperature',
					data: data.averages,
					zIndex: 1,
					marker: {
						fillColor: 'white',
						lineWidth: 2,
						lineColor: Highcharts.getOptions().colors[0]
					}
				}, {
					name: 'Range',
					data: data.ranges,
					type: 'arearange',
					lineWidth: 0,
					linkedTo: ':previous',
					color: Highcharts.getOptions().colors[0],
					fillOpacity: 0.3,
					zIndex: 0
				}]

			});
		}
	}
	
	componentWillUnmount () {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}
	
	edit () {
		this.setState({ editMode: true, locationFailed: null });
	}
	
	save () {
		const text = this.locationInput.value;
		this.setState({ editMode: false });
		this.tryLocation(text);
	}
	
	tryLocation (text) {
		if (!text) return;
		text = text.trim();
		const parts = text.split(',');
		const city = parts[0].trim();
		if (!city)
			return;
		const country = (parts[1] || this.state.country).trim();
		
		this.setState({
			tryingNewLocation: city + ', ' + country
		});
		this._fetchData(city, country).then(
			ok => this.setState({
				city,
				country,
				tryingNewLocation: null,
			}),
			err => {
				// clear the error because we're keeping the previous location
				this.setState({
					error: null,
					tryingNewLocation: null,
					locationFailed: text,
				});
			}
		);
	}
	
	refresh () {
		this._fetchData(this.state.city, this.state.country);
	}
	
	_fetchData (city, country) {
		this.setState({ updating: true });
		return fetch(`//api.openweathermap.org/data/2.5/forecast?q=${city},${country}&mode=json&units=metric&appid=ce9c80839a617fa92cb3848e35277e0a`, {
			mode: 'cors'
		})
			.then(response => response.json())
			.then(data => {
				this.setState({ updating: false, error: null, lastUpdate: Date.now() });
				this._loadData(data);
			})
			.catch(err => {
				this.setState({ updating: false, error: err });
				throw err;
			});
	}
	
	remove () {
		this.props.onRemove(this);
	}
	
	_loadData (data) {
		window.data = data;
		const city = data.city;
		const averages = data.list.map(item => [ +new Date(item.dt_txt + 'Z'), item.main.temp ])
		const ranges = data.list.map(item => [ +new Date(item.dt_txt + 'Z'), item.main.temp_min, item.main.temp_max ]);
		this.setState({ data: { city, averages, ranges } });
	}
	
	render () {
		const status =
			this.state.locationFailed ? `Location not found: ${this.state.locationFailed}` :
			this.state.tryingNewLocation ? `Checking ${this.state.tryingNewLocation}` :
			this.state.editMode ? 'Enter city and country, e.g. "paris,fr". If omitted, country defaults to current one.' :
			(this.state.updating && !this.state.data) ? 'Loading...' :
			this.state.error ? 'Update failed' :
			`Updated at ${new Date(this.state.lastUpdate).toLocaleTimeString()}`;
		return (
			<div className="WeatherWidget">
				{!this.state.editMode ? this.renderLocationView() : this.renderLocationEdit()}
				<div className="status">{status}</div>
				<div className="chart" ref={node => this.chartContainer = node}></div>
				<div className="buttons">
					<button onClick={this.doRefresh} disabled={this.state.updating} title="Update now"><Icon>cached</Icon></button>
					<button onClick={this.doRemove} title="Remove"><Icon>clear</Icon></button>
				</div>
			</div>
		);
	}
	
	renderLocationView () {
		return (
			<div className="location">
				<Icon>room</Icon>
				{this.getLocation()}
				<button onClick={this.doEdit} disabled={this.state.tryingNewLocation} title="Change location"><Icon>edit</Icon></button>
			</div>
		);
	}
	
	renderLocationEdit () {
		return (
			<div className="location">
				<Icon>room</Icon>
				{this.getLocation()}
				<Icon>forward</Icon>
				<input ref={node => this.locationInput = node} placeholder="Paris, France" onKeyDown={ev => {if (ev.keyCode == 13) this.save()}} />
				<button onClick={this.doSave} disabled={this.state.tryingNewLocation} title="Change location"><Icon>done</Icon></button>
			</div>
		);
	}
	
	getLocation () {
		// city name and country from the service have priority
		const cityData = (this.state.data || {}).city || {};
		const city = cityData.name || this.state.city;
		const country = cityData.country || this.state.country;
		return `${city}, ${countryCodeToName[country.toUpperCase()] || country}`;
	}
}

Widget.propTypes = {
	city: PropTypes.string,
	country: PropTypes.string,
	onRemove: PropTypes.func,
};

const noop = _ => {};
Widget.defaultProps = {
	city: 'lonDON',
	country: 'GB',
	onRemove: noop,
};

export default Widget;
