import { formatDistanceToNow } from 'date-fns';

const UserList = ({ users, selectedUser, onUserSelect, currentUser }) => {
  return (
    <div className="w-1/3 bg-white border-r border-gray-300">
      <div className="p-4 border-b border-gray-300">
        <h2 className="text-lg font-semibold text-gray-800">Chats</h2>
        <p className="text-sm text-gray-600">Welcome, {currentUser?.name}</p>
      </div>
      <div className="overflow-y-auto h-full">
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => onUserSelect(user)}
            className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedUser?._id === user._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                ></div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">
                  {user.isOnline
                    ? 'Online'
                    : `Last seen ${formatDistanceToNow(new Date(user.lastSeen), {
                        addSuffix: true,
                      })}`}
                </p>
              </div>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No users available
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;