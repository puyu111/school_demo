import { WarningOutlined } from '@ant-design/icons';
import { Alert } from 'antd';

const ConflictAlert = ({ conflicts, onClose }) => {
  if (!conflicts || conflicts.length === 0) {
    return null;
  }

  return (
    <Alert
      message="存在冲突"
      description={
        <div>
          {conflicts.map((conflict) => (
            <div
              key={conflict}
              style={{
                marginBottom:
                  conflicts.indexOf(conflict) < conflicts.length - 1
                    ? '4px'
                    : '0',
              }}
            >
              • {conflict}
            </div>
          ))}
        </div>
      }
      type="error"
      closable
      onClose={onClose}
      icon={<WarningOutlined />}
      style={{ borderRadius: '6px' }}
    />
  );
};

export default ConflictAlert;
