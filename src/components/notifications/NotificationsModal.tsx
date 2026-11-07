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
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'order':
      case 'orders':
        return <Package className="w-5 h-5 text-purple-400" />;
      case 'promo':
        return <Tag className="w-5 h-5 text-amber-400" />;
      default:
        return <Bell className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9994] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-white max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-white">مركز الإشعارات والعروض</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
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
                  ? 'bg-neutral-950/60 border-neutral-850 text-neutral-300'
                  : 'bg-neutral-950 border-amber-500/30 text-white shadow-sm'
              }`}
            >
              <div className="p-2 rounded-xl bg-neutral-900 h-fit border border-neutral-800">
                {getIcon(notif.category || notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs sm:text-sm font-bold truncate">{notif.title}</h4>
                  <span className="text-[10px] text-neutral-500 flex-shrink-0">{notif.date || notif.time}</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
