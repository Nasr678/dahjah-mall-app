import React from 'react';
import { motion } from 'motion/react';
import { INITIAL_NOTIFICATIONS } from '../../data/mockData';
import { NotificationItem } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { X, Bell, Flame, Package, Tag } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (notif: NotificationItem) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const { notifications } = useMarketplace();
  if (!isOpen) return null;

  const displayList = notifications && notifications.length > 0 ? notifications : INITIAL_NOTIFICATIONS;

  const getIcon = (type?: string) => {
    switch (type) {
      case 'deal':
      case 'offers':
        return <Flame className="w-5 h-5 text-rose-600" />;
      case 'order':
      case 'orders':
        return <Package className="w-5 h-5 text-purple-600" />;
      case 'promo':
        return <Tag className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9994] flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-5 sm:p-6 shadow-2xl text-neutral-900 max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-black text-neutral-950">مركز الإشعارات والعروض</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#F6F7F9] border border-neutral-200 text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {displayList.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (onSelectAction) onSelectAction(notif);
                onClose();
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                notif.isRead
                  ? 'bg-[#F6F7F9] border-neutral-200/80 text-neutral-700 hover:border-neutral-300'
                  : 'bg-amber-50/70 border-amber-300 text-neutral-950 shadow-sm hover:border-amber-400'
              }`}
            >
              <div className="p-2 rounded-xl bg-white h-fit border border-neutral-200">
                {getIcon(notif.category || notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-950 truncate">{notif.title}</h4>
                  <span className="text-[10px] text-neutral-500 flex-shrink-0 tabular-nums">{notif.date || notif.time}</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
