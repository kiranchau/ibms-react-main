import React from 'react';
import { TimePicker } from 'antd';
import { FloatingLabel, Form } from 'react-bootstrap';

import dayjs from "dayjs"
import 'dayjs/locale/en';
import { calculateTimeDuration } from '../../../Utils/dateFormat';

function convertToHHMMA(timeValue) {
  // Parse the time value using Day.js
  const parsedTime = dayjs(timeValue);

  // Format the time value as hh:mm:ss
  const formattedTime = parsedTime.format('hh:mm A');

  return formattedTime;
}

const TimeRangePicker = ({ updatedtaskData, setUpdatetaskdData,  callEntryErrors, setCallEntryErrors }) => {
  const handleStartTimeChange = (time) => {
    let callerr = callEntryErrors
    if (callerr.hasOwnProperty("start_time")) {
        delete callerr["start_time"]
    }
    if (callerr.hasOwnProperty("date_time_validation")) {
        delete callerr["date_time_validation"]
    }
    setCallEntryErrors(callerr)
    setUpdatetaskdData({ ...updatedtaskData, start_time: time ? convertToHHMMA(time) : null, call_log_duration: calculateTimeDuration(updatedtaskData?.start_date, time ? convertToHHMMA(time) : null, updatedtaskData?.stop_date, updatedtaskData.end_time) });
  };

  const handleEndTimeChange = (time,) => {
    let callerr = callEntryErrors
    if (callerr.hasOwnProperty("end_time")) {
        delete callerr["end_time"]
    }
    if (callerr.hasOwnProperty("date_time_validation")) {
        delete callerr["date_time_validation"]
    }
    setCallEntryErrors(callerr)
    setUpdatetaskdData({ ...updatedtaskData, end_time: time ? convertToHHMMA(time) : null, call_log_duration: calculateTimeDuration(updatedtaskData?.start_date, updatedtaskData.start_time, updatedtaskData?.stop_date, time ? convertToHHMMA(time) : null) });
  };

  return (
    <div className='start-end-time gap-3'>
      <div>
      <div className='myInputBox time'>
        <label style={{ display: "block" }}>Start Time *</label>
        <TimePicker
          format="hh:mm A"
          value={updatedtaskData?.start_time ? dayjs(updatedtaskData?.start_time, "hh:mm A") : ""}
          onChange={handleStartTimeChange}
          placeholder="Start Time"
          className='myDatePicker'
        />
      </div>
      {callEntryErrors?.start_time ? <span className='ms-2 text-danger'>{callEntryErrors?.start_time}</span> : null}
      </div>
      <div>
      <div className='myInputBox time'>
        <label style={{ display: "block" }}>Stop Time *</label>
        <TimePicker
          format="hh:mm A"
          value={updatedtaskData?.end_time ? dayjs(updatedtaskData?.end_time, "hh:mm A") : ""}
          onChange={handleEndTimeChange}
          placeholder="Stop Time"
          className='myDatePicker'
        />
      </div>
      {callEntryErrors?.end_time ? <span className='ms-2 text-danger'>{callEntryErrors?.end_time}</span> : null}
      </div>
      <div className=' time'>
        <FloatingLabel label="Total Duration">
          <Form.Control readOnly={true} type="text" placeholder="Total Duration" name='call_duration' value={updatedtaskData?.call_log_duration ?? ""} />
        </FloatingLabel>
      </div>
    </div>
  );
};

export default TimeRangePicker;
