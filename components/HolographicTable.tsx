import React from 'react';
import { Table, ConfigProvider, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface DataType {
  key: string;
  id: string;
  status: string;
  power: number;
  temp: number;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'UNIT ID',
    dataIndex: 'id',
    key: 'id',
    render: (text) => <span className="font-mono text-holo-cyan tracking-wider">{text}</span>,
  },
  {
    title: 'STATUS',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      let color = 'default';
      if (status === 'ACTIVE') color = '#00F0FF';
      if (status === 'STANDBY') color = 'gold';
      if (status === 'CRITICAL') color = '#FF2A2A';
      
      return (
        <Tag color={color} style={{ backgroundColor: 'transparent', borderColor: color, color: color }}>
           {status}
        </Tag>
      );
    },
  },
  {
    title: 'OUTPUT',
    dataIndex: 'power',
    key: 'power',
    render: (val) => (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-holo-cyan" 
                    style={{ width: `${val}%`, boxShadow: '0 0 5px #00F0FF' }}
                ></div>
            </div>
            <span className="text-xs font-mono text-white/70">{val}%</span>
        </div>
    )
  },
  {
    title: 'TEMP',
    dataIndex: 'temp',
    key: 'temp',
    render: (val) => <span className={`font-mono ${val > 80 ? 'text-alert-red animate-pulse' : 'text-holo-blue'}`}>{val}°C</span>,
  },
];

const data: DataType[] = [
  { key: '1', id: 'MK-85-A', status: 'ACTIVE', power: 98, temp: 42 },
  { key: '2', id: 'MK-85-B', status: 'STANDBY', power: 15, temp: 24 },
  { key: '3', id: 'MK-85-C', status: 'ACTIVE', power: 87, temp: 56 },
  { key: '4', id: 'MK-85-D', status: 'CRITICAL', power: 99, temp: 89 },
  { key: '5', id: 'MK-85-E', status: 'ACTIVE', power: 65, temp: 45 },
];

const tableStyles = `
  .holo-table .ant-table {
      background: transparent !important;
  }
  .holo-table .ant-table-thead > tr > th {
      border-bottom: 1px solid rgba(0, 240, 255, 0.3) !important;
  }
  .holo-table .ant-table-tbody > tr > td {
      border-bottom: 1px solid rgba(0, 240, 255, 0.1) !important;
      transition: all 0.3s;
  }
  .holo-table .ant-table-tbody > tr:hover > td {
      background: rgba(0, 240, 255, 0.05) !important;
      text-shadow: 0 0 5px rgba(0, 240, 255, 0.5);
  }
  .holo-table .ant-empty-description {
      color: rgba(0, 240, 255, 0.5);
  }
`;

export const HolographicTable = React.memo(() => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgContainer: 'transparent',
          colorText: '#00F0FF',
          colorBorder: 'rgba(0, 240, 255, 0.3)',
          colorTextHeading: '#00A3FF',
          fontFamily: 'Orbitron, monospace',
          fontSize: 12,
        },
        components: {
          Table: {
            borderColor: 'rgba(0, 240, 255, 0.2)',
            headerBg: 'rgba(0, 20, 40, 0.8)',
            headerColor: '#00F0FF',
            rowHoverBg: 'rgba(0, 240, 255, 0.1)',
          }
        }
      }}
    >
      <div className="relative p-1 border border-holo-cyan/30 bg-black/40 backdrop-blur-md rounded-sm w-[600px]">
          {/* Decorative Corners */}
          <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-holo-cyan"></div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-holo-cyan"></div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-holo-cyan"></div>
          <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-holo-cyan"></div>
          
          <div className="text-xs text-holo-cyan/50 mb-2 uppercase tracking-[0.2em] border-b border-holo-cyan/20 pb-1 flex justify-between items-center">
              <span>Unit Status Log</span>
              <div className="flex gap-1">
                  <span className="w-1 h-1 bg-holo-cyan rounded-full animate-ping"></span>
                  <span className="text-[8px]">LIVE FEED</span>
              </div>
          </div>

          <Table 
            columns={columns} 
            dataSource={data} 
            pagination={false} 
            size="small"
            className="holo-table"
          />
          
          <style>{tableStyles}</style>
      </div>
    </ConfigProvider>
  );
});
