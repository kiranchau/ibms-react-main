import React from 'react';
import '../../SCSS/popups.scss';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import InputField from '../../commonModules/UI/InputField';
import SqButton from '../../commonModules/UI/SqButton';
import TableBtn from "../../commonModules/UI/TableBtn";
import * as RiIconIcons from "react-icons/ri";
import * as FiIcons from "react-icons/fi";

const Taskspopcol1 = ({ updatedtaskData, setUpdatetaskdData, jobCodes, serviceTypes, paymentTerms, customerList }) => {
  const onChangeHandler = (e) => {
      setUpdatetaskdData({ ...updatedtaskData, [e.target.name]: e.target.value })
  }

  const CustomerTable = [
    {
      name: "Ryan Speer",
      email: "Aug 2, 2002",
      address: "TX.",
      status: "Completed",

    },
    {
      name: "Ryan Speer",
      email: "Aug 2, 2002",
      address: "TX.",
      status: "process",
    },
    {
      name: "Ryan Speer",
      email: "Aug 2, 2002",
      address: "TX.",
      status: "Urgent",
    },
  ];

  

  return (
    <div className='mx-3 pt-1' style={{borderBottom: '2px solid black'}}>
      <div className='row'>
        <div className='col'>
       
        <div>
            <div className='d-flex flex-wrap w-100'>
                <div className='w-50 py-2 pe-4'>
                    <FloatingLabel label="Client">
                        <Form.Select aria-label="Client" name='customer' value={updatedtaskData?.customer ?? ""} onChange={onChangeHandler}>
                            <option key={0}>Select Client</option>
                            {customerList?.length > 0 && customerList.map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                </div>
                <div className='w-50 py-2'>
                    <FloatingLabel label="Job Code">
                        <Form.Select aria-label="Job" name='project' value={updatedtaskData?.project ?? ""} onChange={onChangeHandler}>
                            <option key={0}>Assign Code</option>
                            {jobCodes?.length > 0 && jobCodes.map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                </div>

                <div className='w-50 py-2 pe-4'>
                    <FloatingLabel label="Task Name">
                        <Form.Control type="text" placeholder="Job Name" name='name' value={updatedtaskData?.name ?? ""} onChange={onChangeHandler} />
                    </FloatingLabel>
                </div>
                <div className='w-50 py-2 '>
                    <FloatingLabel label="Task Details">
                        <Form.Control
                            as="textarea"
                            placeholder="Leave a comment here"
                            style={{ height: '100px' }}
                            name='description'
                        />
                    </FloatingLabel>
                </div>

                {/* ============= */}
                <Form.Check // prettier-ignore
                    type="checkbox" label="Customer Review Task" name='priority' value='1' />
                <Form.Check // prettier-ignore
                    type="checkbox" label="Task Being Worked On" name='status' value='1' />

                <div className='w-50 py-2 pe-4'>
                    <FloatingLabel label="SERVICE TYPE ">
                        <Form.Select aria-label="SERVICE TYPE *" name='recurrence_frequency' value={updatedtaskData?.recurrence_frequency ?? ""} onChange={onChangeHandler}>
                            <option key={0}>Assign Code</option>
                            {serviceTypes?.length > 0 && serviceTypes.map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                </div>

                <div className='w-50 py-2 pe-4'>
                    <FloatingLabel label="Desired Due Date">
                        <Form.Control type="date" placeholder="Desired Due Date" name='desired_due_date' value={updatedtaskData?.desired_due_date ?? ""} onChange={onChangeHandler} />
                    </FloatingLabel>
                </div>

                <Form.Check // prettier-ignore
                    type="checkbox"
                    label="Task Being Worked On"
                    name='priority'
                    value='1'
                />

                <div className='w-50 py-2'>
                    <FloatingLabel label="Project Deadline">
                        <Form.Control type="date" placeholder="Project Deadline" name='deadline' value={updatedtaskData?.deadline ?? ""} onChange={onChangeHandler} />
                    </FloatingLabel>
                </div>

                <div className='w-50 py-2'>
                    <Form.Check // prettier-ignore
                        type="checkbox"
                        label="Urgent / Priority"
                        name='status'
                        value='0'
                    />

                    <div className='row'>
                        <div className='col-4'>
                            <InputField type="time" className="bgColors ">Estimated Duration</InputField>
                        </div>
                        <div className='col-4'>
                            <InputField type="time" className="bgColors">Actual Duration</InputField>
                        </div>
                        <div className='col-4'>
                            <div className='d-flex align-items-center custInput'>
                                <input type="checkbox" />
                                <label>Tally duration from Activity / Notes</label>
                            </div>

                        </div>
                        <div className='col-4'>
                            <div className='d-flex align-items-center custInput mb-3'>
                                <input type="checkbox" />
                                <label>Mark TASK as COMPLETED</label>
                            </div>
                        </div>
                        <div className='col-4'>
                            <InputField type="date" className="bgColors">Date Completed</InputField>
                        </div>
                    </div>

                </div>

                <div className='w-50 py-2'>
                    <FloatingLabel label="Project Deadline">
                        <Form.Control type="date" placeholder="Project Deadline" name='start_date' value={updatedtaskData?.start_date ?? ""} onChange={onChangeHandler} />
                    </FloatingLabel>
                </div>
                <div className='w-50 py-2 pe-4'>
                    <FloatingLabel label="Desired Due Date">
                        <Form.Control type="date" placeholder="Desired Due Date" name='end_date' value={updatedtaskData?.end_date ?? ""} onChange={onChangeHandler} />
                    </FloatingLabel>
                </div>
                <div className='w-50 py-2 pe-4'>
                    <FloatingLabel label="TASK / HOURLY BILLING & COMPLETE JOB / FLAT RATE BILLING *">
                        <Form.Select aria-label="Responsible User" name='projected_hours' value={updatedtaskData?.projected_hours ?? ""} onChange={onChangeHandler}>
                            <option>Select billing type</option>
                            <option value="1">Active</option>
                            <option value="2">Inactive</option>
                            <option value="3">Contract Phase</option>
                        </Form.Select>
                    </FloatingLabel>
                </div>
                <div className='w-50 py-2'>
                    <FloatingLabel label="PAYMENT TERM">
                        <Form.Select aria-label="Responsible User" name='billing_type' value={updatedtaskData?.billing_type ?? ""} onChange={onChangeHandler}>
                            <option>Select Payment type</option>
                            {paymentTerms?.length > 0 && paymentTerms.map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                </div>
            </div>
        </div>
    
        </div>
        <div className='col-3'>
          <div className='px-2 py-1 d-flex align-items-center justify-content-between popSubTitle'>
            ASSIGNED USER(S) <SqButton className="popSubBtn"> + Assigned Urs</SqButton>
          </div>
          <div className="custTable">
            <table>
              <tr>
                <th>Name</th>
                <th>Due Date</th>
                <th>STS</th>
                <th></th>
              </tr>
              {CustomerTable.map((cust, index) => (
                <tr>
                  <td>{cust.name}</td>
                  <td>{cust.email}</td>
                  <td>
                    <div className="clrStatus" style={{
                      backgroundColor:
                        ((cust.status === 'Completed' && '#2705FA') ||
                          (cust.status === 'Updated' && '#a563a6') ||
                          (cust.status === 'Urgent' && '#Ff6161')
                        )
                    }}></div>
                  </td>
                  <td>
                    <div className="grpofBtn">
                      <TableBtn className="edit">
                        <FiIcons.FiEdit />
                      </TableBtn>
                      <TableBtn className="delete">
                        <RiIconIcons.RiDeleteBin6Line />
                      </TableBtn>

                    </div>
                  </td>
                </tr>
              ))}
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Taskspopcol1;
