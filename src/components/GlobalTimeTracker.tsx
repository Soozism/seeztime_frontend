import React, { useState } from 'react';
import {
  Card,
  Typography,
  Space,
  Button,
  Input,
  Tooltip,
  Tag,
  Modal,
  Select,
  message,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SettingOutlined,
  SwapOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTimeTracking } from '../contexts/TimeTrackingContext';
import { Task } from '../types';
import TaskService from '../services/taskService';

const { Text } = Typography;
const { Option } = Select;

interface GlobalTimeTrackerProps {
  className?: string;
  style?: React.CSSProperties;
}

const GlobalTimeTracker: React.FC<GlobalTimeTrackerProps> = ({ className, style }) => {
  const {
    isRunning,
    formattedTime,
    taskId,
    description,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopAndSaveTimer,
    resetTimer,
    updateDescription,
    switchTask,
  } = useTimeTracking();

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [switchTaskVisible, setSwitchTaskVisible] = useState(false);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTaskForSwitch, setSelectedTaskForSwitch] = useState<number | null>(null);
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // Load available tasks for switching
  const loadAvailableTasks = async () => {
    try {
      setLoading(true);
      const tasks = await TaskService.getTasks({}); // Get tasks with default filter
      setAvailableTasks(tasks);
    } catch (error) {
      message.error('خطا در بارگذاری لیست وظایف');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchTask = async () => {
    if (!selectedTaskForSwitch) {
      message.warning('لطفاً یک وظیفه انتخاب کنید');
      return;
    }

    try {
      await switchTask(selectedTaskForSwitch, newTaskDescription, true);
      setSwitchTaskVisible(false);
      setSelectedTaskForSwitch(null);
      setNewTaskDescription('');
      message.success('وظیفه تغییر یافت');
    } catch (error) {
      message.error('خطا در تغییر وظیفه');
    }
  };

  const currentTask = availableTasks.find(task => task.id === taskId);

  if (!isRunning && !taskId) {
    return null; // Don't show widget when no timer is active
  }

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        ...style,
      }}
    >
      <Card
        size="small"
        style={{
          width: '320px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {/* Timer Display */}
          <div style={{ textAlign: 'center' }}>
            <Text strong style={{ fontSize: '18px', fontFamily: 'monospace' }}>
              <ClockCircleOutlined style={{ marginRight: '8px' }} />
              {formattedTime}
            </Text>
          </div>

          {/* Current Task Info */}
          {currentTask && (
            <div style={{ textAlign: 'center' }}>
              <Tag color="blue" style={{ marginBottom: '4px' }}>
                {currentTask.title}
              </Tag>
              {description && (
                <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                  {description}
                </Text>
              )}
            </div>
          )}

          {/* Controls */}
          <Space style={{ width: '100%', justifyContent: 'center' }}>
            {!isRunning ? (
              <Tooltip title="ادامه">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={resumeTimer}
                  size="small"
                />
              </Tooltip>
            ) : (
              <Tooltip title="توقف">
                <Button
                  icon={<PauseCircleOutlined />}
                  onClick={pauseTimer}
                  size="small"
                />
              </Tooltip>
            )}

            <Tooltip title="ثبت و پایان">
              <Button
                type="primary"
                icon={<StopOutlined />}
                onClick={stopAndSaveTimer}
                size="small"
                danger
              />
            </Tooltip>

            <Tooltip title="تغییر وظیفه">
              <Button
                icon={<SwapOutlined />}
                onClick={() => {
                  loadAvailableTasks();
                  setSwitchTaskVisible(true);
                }}
                size="small"
              />
            </Tooltip>

            <Tooltip title="تنظیمات">
              <Button
                icon={<SettingOutlined />}
                onClick={() => setSettingsVisible(true)}
                size="small"
              />
            </Tooltip>
          </Space>
        </Space>
      </Card>

      {/* Settings Modal */}
      <Modal
        title="تنظیمات زمان‌سنج"
        open={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setSettingsVisible(false)}>
            بستن
          </Button>,
          <Button
            key="reset"
            danger
            onClick={() => {
              Modal.confirm({
                title: 'ریست زمان‌سنج',
                content: 'آیا مطمئن هستید که می‌خواهید زمان‌سنج را ریست کنید؟ تمام زمان ثبت نشده از دست خواهد رفت.',
                okText: 'بله، ریست کن',
                cancelText: 'انصراف',
                onOk: () => {
                  resetTimer();
                  setSettingsVisible(false);
                },
              });
            }}
          >
            ریست زمان‌سنج
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>توضیحات جلسه:</Text>
            <Input
              value={description}
              onChange={(e) => updateDescription(e.target.value)}
              placeholder="توضیحات کار انجام شده..."
              style={{ marginTop: '8px' }}
            />
          </div>
        </Space>
      </Modal>

      {/* Switch Task Modal */}
      <Modal
        title="تغییر وظیفه"
        open={switchTaskVisible}
        onCancel={() => {
          setSwitchTaskVisible(false);
          setSelectedTaskForSwitch(null);
          setNewTaskDescription('');
        }}
        onOk={handleSwitchTask}
        confirmLoading={loading}
        okText="تغییر وظیفه"
        cancelText="انصراف"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>انتخاب وظیفه جدید:</Text>
            <Select
              style={{ width: '100%', marginTop: '8px' }}
              placeholder="وظیفه مورد نظر را انتخاب کنید"
              value={selectedTaskForSwitch}
              onChange={setSelectedTaskForSwitch}
              loading={loading}
              showSearch
              filterOption={(input, option) =>
                option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
              }
            >
              {availableTasks.map(task => (
                <Option key={task.id} value={task.id}>
                  {task.title} ({task.project_name})
                </Option>
              ))}
            </Select>
            {selectedTaskForSwitch && (
              <Button
                type="link"
                style={{ marginTop: '8px' }}
                onClick={() => {
                  window.location.href = `/tasks/${selectedTaskForSwitch}`;
                }}
              >
                مشاهده جزئیات وظیفه
              </Button>
            )}
          </div>

          <div>
            <Text strong>توضیحات جلسه جدید:</Text>
            <Input
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="توضیحات کار جدید..."
              style={{ marginTop: '8px' }}
            />
          </div>

          {isRunning && (
            <div style={{ backgroundColor: '#fff7e6', padding: '8px', borderRadius: '4px' }}>
              <Text type="warning">
                <ClockCircleOutlined style={{ marginRight: '4px' }} />
                زمان فعلی ابتدا ذخیره و سپس وظیفه جدید شروع خواهد شد.
              </Text>
            </div>
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default GlobalTimeTracker;
