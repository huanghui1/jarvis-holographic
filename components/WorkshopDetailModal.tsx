import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, ConfigProvider, Tabs, Badge, Progress, Row, Col, Card } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { HolographicTable } from './HolographicTable';

interface WorkshopDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshopName: string | null;
}

// --- Custom Statistic Component to replace deprecated Antd Statistic ---
const HoloStatistic: React.FC<{
  title: React.ReactNode;
  value: string | number;
  precision?: number;
  suffix?: React.ReactNode;
  valueStyle?: React.CSSProperties;
}> = React.memo(({ title, value, precision, suffix, valueStyle }) => {
  let displayVal = value;
  if (typeof value === 'number' && precision !== undefined) {
    displayVal = value.toFixed(precision);
  }

  return (
    <div className="flex flex-col">
      <div className="mb-1" style={{ color: 'rgba(0, 240, 255, 0.6)', fontSize: '12px' }}>{title}</div>
      <div className="flex items-baseline" style={{ color: '#FFFFFF', fontFamily: 'monospace', fontSize: '24px', fontWeight: 'bold', ...valueStyle }}>
        {displayVal}
        {suffix && <span className="ml-1 text-sm opacity-80">{suffix}</span>}
      </div>
    </div>
  );
});

// --- Mock Data for Charts ---
const productionData = Array.from({ length: 20 }, (_, i) => ({
    time: `10:${i < 10 ? '0' + i : i}`,
    output: Math.floor(Math.random() * 50) + 50,
    target: 80,
}));

const efficiencyData = [
    { name: '设备A', val: 85 },
    { name: '设备B', val: 92 },
    { name: '设备C', val: 78 },
    { name: '设备D', val: 65 },
    { name: '设备E', val: 88 },
];

const modalCssStyles = `
    .holo-modal-wrapper .ant-modal-content {
        border-radius: 0 !important;
    }
    .text-shadow-glow {
        text-shadow: 0 0 10px rgba(0, 240, 255, 0.8);
    }
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(0,0,0,0.3);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(0, 240, 255, 0.3);
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 240, 255, 0.6);
    }
`;

export const WorkshopDetailModal: React.FC<WorkshopDetailModalProps> = React.memo(({ isOpen, onClose, workshopName }) => {
  const [activeTab, setActiveTab] = useState('1');

  // Reset tab on open
  useEffect(() => {
    if (isOpen) setActiveTab('1');
  }, [isOpen]);

  const modalStyles = useMemo(() => ({
    content: {
        background: 'rgba(0, 10, 20, 0.9)',
        border: '1px solid #00F0FF',
        boxShadow: '0 0 30px rgba(0, 240, 255, 0.2), inset 0 0 50px rgba(0, 240, 255, 0.05)',
        // Reduced blur radius to improve performance
        backdropFilter: 'blur(5px)',
        borderRadius: '4px',
    },
    header: {
        background: 'transparent',
        borderBottom: '1px solid rgba(0, 240, 255, 0.3)',
        paddingBottom: '10px',
        marginBottom: '20px',
    },
    mask: {
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(2px)',
    }
  }), []);

  const modalRender = useCallback((modal: React.ReactNode) => (
    <div className="holo-modal-wrapper animate-zoom-in">
        {modal}
    </div>
  ), []);

  const themeConfig = useMemo(() => ({
      token: {
          colorText: '#00F0FF',
          colorBgContainer: 'transparent',
          fontFamily: 'Orbitron, sans-serif',
          colorPrimary: '#00F0FF',
      },
      components: {
          Modal: {
              contentBg: 'transparent',
              headerBg: 'transparent',
          },
          Tabs: {
              itemColor: 'rgba(0, 240, 255, 0.5)',
              itemSelectedColor: '#00F0FF',
              itemHoverColor: '#FFFFFF',
              inkBarColor: '#00F0FF',
          },
      }
  }), []);

  return (
    <ConfigProvider theme={themeConfig}>
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={1000}
            centered
            destroyOnClose
            modalRender={modalRender}
            styles={modalStyles}
            closeIcon={<span className="text-holo-cyan text-xl hover:text-white transition-colors">×</span>}
        >
            {/* Header Area */}
            <div className="flex justify-between items-center mb-6 border-b border-holo-cyan/30 pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-holo-cyan shadow-[0_0_10px_#00F0FF]"></div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-widest uppercase m-0 text-shadow-glow">
                            {workshopName || '未知区域'}
                        </h2>
                        <span className="text-xs text-holo-cyan/60 font-mono tracking-widest">SECTOR-07 // COMMAND LINK ESTABLISHED</span>
                    </div>
                </div>
                <div className="flex gap-4">
                     <Badge status="processing" text={<span className="text-holo-cyan">在线</span>} />
                     <Badge status="success" text={<span className="text-holo-cyan">安全</span>} />
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                items={[
                    {
                        key: '1',
                        label: '生产监控',
                        children: (
                            <div className="space-y-6">
                                {/* Top Stats Row */}
                                <Row gutter={16}>
                                    <Col span={6}>
                                        <Card size="small" className="bg-white/5 border border-holo-cyan/20">
                                            <HoloStatistic title="实时产量 (Units/h)" value={1284} precision={0} valueStyle={{ color: '#00F0FF' }} />
                                        </Card>
                                    </Col>
                                    <Col span={6}>
                                        <Card size="small" className="bg-white/5 border border-holo-cyan/20">
                                            <HoloStatistic title="综合良率" value={98.5} precision={1} suffix="%" valueStyle={{ color: '#52c41a' }} />
                                        </Card>
                                    </Col>
                                    <Col span={6}>
                                        <Card size="small" className="bg-white/5 border border-holo-cyan/20">
                                            <HoloStatistic title="平均节拍 (s)" value={42.3} precision={1} valueStyle={{ color: '#faad14' }} />
                                        </Card>
                                    </Col>
                                    <Col span={6}>
                                        <Card size="small" className="bg-white/5 border border-holo-cyan/20">
                                            <HoloStatistic title="运行时间" value="248:12:05" valueStyle={{ fontSize: '18px', color: '#fff' }} />
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Charts Row */}
                                <Row gutter={16} className="h-64">
                                    <Col span={16} className="h-full">
                                        <div className="h-full border border-holo-cyan/20 p-4 bg-black/20 relative">
                                            <div className="absolute top-0 left-0 px-2 py-1 text-xs text-holo-cyan bg-holo-cyan/10">产量趋势分析</div>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={productionData}>
                                                    <defs>
                                                        <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 240, 255, 0.1)" vertical={false} />
                                                    <XAxis dataKey="time" stroke="rgba(0, 240, 255, 0.5)" tick={{fontSize: 10}} />
                                                    <YAxis stroke="rgba(0, 240, 255, 0.5)" tick={{fontSize: 10}} />
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #00F0FF', color: '#fff' }}
                                                        itemStyle={{ color: '#00F0FF' }}
                                                    />
                                                    <Area type="monotone" dataKey="output" stroke="#00F0FF" fillOpacity={1} fill="url(#colorOutput)" />
                                                    <Area type="monotone" dataKey="target" stroke="#FF2A2A" strokeDasharray="5 5" fill="none" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Col>
                                    <Col span={8} className="h-full">
                                        <div className="h-full border border-holo-cyan/20 p-4 bg-black/20 relative">
                                             <div className="absolute top-0 left-0 px-2 py-1 text-xs text-holo-cyan bg-holo-cyan/10">设备OEE效率</div>
                                             <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={efficiencyData} layout="vertical" margin={{ left: 20 }}>
                                                    <XAxis type="number" hide />
                                                    <YAxis type="category" dataKey="name" stroke="rgba(0, 240, 255, 0.5)" width={50} tick={{fontSize: 10}} />
                                                    <Tooltip cursor={{fill: 'rgba(0, 240, 255, 0.05)'}} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #00F0FF' }} />
                                                    <Bar dataKey="val" barSize={15}>
                                                        {efficiencyData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.val > 90 ? '#00F0FF' : entry.val > 70 ? '#00A3FF' : '#faad14'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                             </ResponsiveContainer>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        )
                    },
                    {
                        key: '2',
                        label: '设备状态日志',
                        children: (
                            <div className="h-[350px] overflow-auto custom-scrollbar">
                                <HolographicTable />
                            </div>
                        )
                    },
                    {
                        key: '3',
                        label: '智能预测',
                        children: (
                            <div className="h-[350px] flex items-center justify-center border border-dashed border-holo-cyan/30 text-holo-cyan/50">
                                <div className="text-center">
                                    <div className="text-4xl mb-4 animate-pulse">AI MODULE LOADING...</div>
                                    <Progress percent={78} status="active" strokeColor={{ from: '#108ee9', to: '#87d068' }} showInfo={false} className="w-64" />
                                </div>
                            </div>
                        )
                    }
                ]}
            />
            
            {/* Footer Decorator */}
            <div className="absolute bottom-2 right-4 text-[10px] text-gray-500 font-mono">
                SYS_VER: 8.4.2 // SECURE CONNECTION
            </div>
        </Modal>
        
        <style>{modalCssStyles}</style>
    </ConfigProvider>
  );
});
