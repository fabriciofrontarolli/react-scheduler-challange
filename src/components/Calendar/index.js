import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Select from 'react-select';
import idGenerator from 'react-id-generator';
import moment from 'moment';
import { addNewSchedule, removeSchedule } from '../../modules/SchedulerReducer';

import './calendar.css';

const DEFAULT_DATE_FORMAT = 'DD/MM/YYYY';
const COLOR_OPTIONS = [{
  value: '#2274A5',
  label: 'Blue'
},{
  value: '#E6AF2E',
  label: 'Yellow'
},{
  value: '#FE4E00',
  label: 'Orange'
},{
  value: '#DAB785',
  label: 'Light'
}]


class Calendar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reminderDescription: undefined,
      reminderDate: undefined,
      reminderTime: undefined,
      reminderColor: undefined,
      selectedDate: moment(),
      weekdays: moment.weekdays(), // ["Sunday", "Monday", "Tuesday", "Wednessday", "Thursday", "Friday", "Saturday"]
      daysOfWeek: (moment.weekdaysShort()), // ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    }

    this.renderDaysOfWeek = this.renderDaysOfWeek.bind(this);
    this.renderDaysInMonth = this.renderDaysInMonth.bind(this);
    this.getWeeksInMonth = this.getWeeksInMonth.bind(this);
    this.getMonthDays = this.getMonthDays.bind(this);
    this.renderRemindersForDate = this.renderRemindersForDate.bind(this);
    this.handleReminderSave = this.handleReminderSave.bind(this);
    this.isSaveAllowed = this.isSaveAllowed.bind(this);
    this.renderReminderInput = this.renderReminderInput.bind(this);
    this.nextMonth = this.nextMonth.bind(this);
    this.previousMonth = this.previousMonth.bind(this);
    this.renderMonthSelection = this.renderMonthSelection.bind(this);
    this.handleReminderEdit = this.handleReminderEdit.bind(this);
  }

  static propTypes = {
    width: PropTypes.string,
    height: PropTypes.string
  }

  static defaultProps = {
    width: '1080px',
    height: '90vh'
  }

  renderDaysOfWeek() {
    const { daysOfWeek } = this.state;

    return (
      <thead>
        <tr key={idGenerator()} className="calendar-days-header">
          { daysOfWeek.map(day => (<th key={idGenerator()}>{day}</th>)) }
        </tr>
      </thead>
    );
  }

  getWeeksInMonth(selectedDate) {
    let clonedMoment = moment(selectedDate), first, last;

    // get week number for first day of month
    first = clonedMoment.startOf('month').week();
    // get week number for last day of month
    last = clonedMoment.endOf('month').week();

    // In case last week is in next year
    if( first > last) {
        last = first + last;
    }

    return last - first + 1;
  }

  getMonthDays(selectedDate) {
    const { daysOfWeek } = this.state;
    const month = selectedDate.month();
    const year = selectedDate.year();
    const firstMonthDay = moment({ month, year, day: 1 });
    const lastMonthDay = moment({ month, year, day: selectedDate.daysInMonth() });

    const date_ = [];

    let week = 1;
    // let dayIndexInWeekCalendar = daysOfWeek.findIndex(day => day === firstMonthDay.format('ddd'));

    while (firstMonthDay <= lastMonthDay) {
      const dayIndexInWeekCalendar = daysOfWeek.findIndex(day => day === firstMonthDay.format('ddd'));
      date_.push({
        dateFormatted: firstMonthDay.format(DEFAULT_DATE_FORMAT),
        dateDayOfWeek: firstMonthDay.format('ddd'),
        week: week,
        dayIndexInWeekCalendar: dayIndexInWeekCalendar
      });

      week = (dayIndexInWeekCalendar === 6) ? week+=1 : week;

      firstMonthDay.add(1, 'days');
    }

    return date_;
  }

  nextMonth() {
    const { selectedDate } = this.state;

    this.setState({
      selectedDate: selectedDate.add(1, 'months')
    });
  }

  previousMonth() {
    const { selectedDate } = this.state;

    this.setState({
      selectedDate: selectedDate.subtract(1, 'months')
    });
  }

  renderRemindersForDate(currentCalendarDay, selectedDate) {
    if (!currentCalendarDay) { return []; }

    const { scheduler } = this.props;
    const { reminders } = scheduler;

    const remindersForDate = reminders.filter(reminder => reminder.date.format(DEFAULT_DATE_FORMAT) === currentCalendarDay.dateFormatted)
                                      .sort((a,b) => a.date.hour() - b.date.hour());

    const remindersElements = remindersForDate.map(reminder => (
      <div className="reminder-container" onClick={() => this.handleReminderEdit(reminder)}>
        <label
          key={idGenerator()}
          className="reminder-text"
          style={{ backgroundColor: reminder.color }}
          title={`${reminder.description} @ ${reminder.date.format('HH:mm')}`}
        >
          { `${reminder.description} @ ${reminder.date.format('HH:mm')}` }
        </label>
        <label
          className="reminder-remove"
          onClick={() => this.props.remove(reminder)}
        >x</label>
      </div>
    ));

    return remindersElements;
  }

  renderDaysInMonth(selectedDate) {
    const { daysOfWeek } = this.state;
    const weeksInMonth = this.getWeeksInMonth(selectedDate);
    const monthInDays = this.getMonthDays(selectedDate);

    const daysOnCalendar = [];

    for (let currentWeek = 1; currentWeek <= weeksInMonth; currentWeek++) {
      const currentWeekDaysRendered = daysOfWeek.map((weekDay, index) => {
        const currentDay = monthInDays.find(day => day.week === currentWeek && day.dayIndexInWeekCalendar === index);

        return (
          <td key={idGenerator()} className="calendar-day-container">
            <div className="calendar-schedule-container">
              <label className="calendar-day-title">{currentDay ? currentDay.dateFormatted : ' - '}</label>
              { this.renderRemindersForDate(currentDay, selectedDate) }
            </div>
          </td>
        );
      });

      daysOnCalendar.push(
        (
          <tr key={idGenerator()}>
            { currentWeekDaysRendered }
          </tr>
        )
      );
    }

    return daysOnCalendar;
  }

  handleReminderSave(evt) {
    evt.preventDefault();
    const { addNew } = this.props;
    const userDateInput = moment(this.state.reminderDate, DEFAULT_DATE_FORMAT);

    const newReminder = {
      description: this.state.reminderDescription,
      date: moment({
        year: userDateInput.year(),
        month: userDateInput.month(),
        day: Number(userDateInput.format("DD")),
        hour: Number(this.state.reminderTime.split(':')[0]),
        minute: Number(this.state.reminderTime.split(':')[1]),
      }),
      color: this.state.reminderColor
    }

    addNew(newReminder);

    this.setState({
      reminderDescription: undefined,
      reminderDate: undefined,
      reminderTime: undefined,
      reminderColor: undefined,
    });
  }

  handleReminderEdit(reminder) {
    this.setState({
      reminderDescription: reminder.description,
      reminderDate: reminder.date.format("DD/MM/YYYY"),
      reminderTime: reminder.date.format("HH:mm:ss"),
      reminderColor: reminder.color,
    });
  }

  isSaveAllowed() {
    const {
      reminderDescription,
      reminderDate,
      reminderTime,
      reminderColor
    } = this.state;

    return (!!reminderDescription && !!reminderDate && !!reminderTime && !!reminderColor);
  }

  renderReminderInput() {
    return (
      <div className="add-reminder-container">
        <input
          type="text"
          placeholder="I need to ..."
          maxLength="30"
          style={{width: '250px'}}
          defaultValue={this.state.reminderDescription}
          onChange={evt => this.setState({ reminderDescription: evt.target.value })}
        ></input>
        <input
          type="text"
          placeholder="dd/mm/yyyy"
          style={{width: '200px', 'textAlign': 'center'}}
          defaultValue={this.state.reminderDate}
          required
          pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
          onChange={evt => this.setState({ reminderDate: evt.target.value })}
        ></input>
        <input
          type="time"
          placeholder="I need to ..."
          style={{width: '200px', 'textAlign': 'center'}}
          defaultValue={this.state.reminderTime}
          onChange={evt => this.setState({ reminderTime: evt.target.value })}
        ></input>
        <Select
          options={COLOR_OPTIONS}
          className="color-selection"
          defaultValue={this.state.reminderColor}
          onChange={evt => this.setState({ reminderColor: evt.value })}
        />
        <button
          onClick={this.handleReminderSave}
          disabled={!this.isSaveAllowed()}
        >Save Reminder</button>
      </div>
    );
  }

  renderMonthSelection() {
    const { selectedDate } = this.state;

    return (
      <div className="month-selection">
        <span className="month-selection-button" onClick={this.previousMonth}>{"<"}</span>
        <h2 className="month-name">{selectedDate.format("MMMM") }</h2>
        <span className="month-selection-button" onClick={this.nextMonth}>{">"}</span>
      </div>
    );
  }

  render () {
    const { selectedDate } = this.state;

    console.log(this.state);

    return (
      <div className="calendar-container">
        { this.renderReminderInput() }
        { this.renderMonthSelection() }
        <table className="calendar-table-content" style={{ width: this.props.width, height: this.props.height }}>
          { this.renderDaysOfWeek() }
          <tbody>
            { this.renderDaysInMonth(selectedDate) }
          </tbody>
        </table>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  scheduler: state.scheduler
});

export default connect(mapStateToProps, {
  addNew: addNewSchedule,
  remove: removeSchedule
})(Calendar);
