import React from 'react';
import { Table } from 'antd';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    responsive: ['md'],
  },
  {
    title: 'Name NameNameNe',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    responsive: ['md'],
  },
  {
    title: 'Name Name Name Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    responsive: ['md'],
  }, {
    title: 'Name Name Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    responsive: ['md'],
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    sorter: (a, b) => a.age - b.age,
    responsive: ['sm'],
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    sorter: (a, b) => a.age - b.age,
    responsive: ['sm'],
  }, {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    sorter: (a, b) => a.age - b.age,
    responsive: ['sm'],
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    sorter: (a, b) => a.address.localeCompare(b.address),
    responsive: ['lg'],
    filters: [
      { text: 'Main St', value: 'Main St' },
      { text: 'Oak St', value: 'Oak St' },
    ],
    onFilter: (value, record) => record.address.indexOf(value) === 0,
  },
];

const data = [
  {
    key: '1',
    name: 'John Doe 456 Oak St456 Oak St456 Oak St456 Oak St',
    age: 25,
    address: '123 Main St 456 Oak St456 Oak St456 Oak St456 Oak St456 Oak St',
  },
  {
    key: '2',
    name: 'Jane Smith',
    age: 30,
    address: '456 Oak S 456 Oak St456 Oak St456 Oak St456 Oak St456 Oak Stt',
  },
  {
    key: '3',
    name: 'John Doe',
    age: 25,
    address: '123 Main St',
  },
  {
    key: '4',
    name: 'Jane Smith',
    age: 30,
    address: '456 Oak St',
  },  {
    key: '5',
    name: 'John Doe',
    age: 25,
    address: '123 Main St',
  },
  {
    key: '6',
    name: 'Jane Smith',
    age: 30,
    address: '456 Oak St',
  },
  {
    key: '7',
    name: 'John Doe',
    age: 25,
    address: '123 Main St',
  },
  {
    key: '8',
    name: 'Jane Smith456 Oak St456 Oak St456 Oak St',
    age: 30,
    address: '456 Oak Stv456 Oak St456 Oak St456 Oak St456 Oak St456 Oak St',
  },  {
    key: '9',
    name: 'John Doev456 Oak St456 Oak St456 Oak St456 Oak St456 Oak St',
    age: 25,
    address: '123 Main St456 Oak St456 Oak St456 Oak St456 Oak St456 Oak St456 Oak St',
  },
  {
    key: '2',
    name: 'Jane Smith',
    age: 30,
    address: '456 Oak St456 Oak St456 Oak St456 Oak St456 Oak St456 Oak St456 Oak St',
  },  {
    key: '1',
    name: 'John Doe',
    age: 25,
    address: '123 Main St 456 Oak St456 Oak St456 Oak St456 Oak St',
  },
  {
    key: '2',
    name: 'Jane Smith',
    age: 30,
    address: '456 Oak St 456 Oak St456 Oak St456 Oak St456 Oak St456 Oak St456 Oak St',
  },
  {
    key: '1',
    name: 'John Doe',
    age: 25,
    address: '123 Main St',
  },
  {
    key: '2',
    name: 'Jane Smith',
    age: 30,
    address: '456 Oak St',
  },  {
    key: '1',
    name: 'John Doe',
    age: 25,
    address: '123 Main St',
  },
  {
    key: '2',
    name: 'Jane Smith',
    age: 30,
    address: '456 Oak St',
  },  {
    key: '1',
    name: 'John Doe',
    age: 25,
    address: '123 Main St',
  },
  {
    key: '2',
    name: 'Jane Smith',
    age: 30,
    address: '456 Oak St',
  },
  // Add more data as needed
];

const ResponsiveTable = () => {
  return (
    <div style={{ overflowX: 'auto', maxWidth: '100%', margin: '100px 20px' }}>
      <Table
        columns={columns}
        dataSource={data}
        scroll={{ x: true, y: 400 }} // Set the y value based on your layout
        pagination={{ pageSize: 10 }}
        onChange={(pagination, filters, sorter) => {
          console.log('Table changed:', pagination, filters, sorter);
        }}
      />
    </div>
  );
};

export default ResponsiveTable;
