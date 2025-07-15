type User = {
  id: string;
  name: string;
  username: string;
  profilePic: string;
};

const users: User[] = [
  {
    id: '1',
    name: 'Sunil Kumar',
    username: 'sunil_dev',
    profilePic: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'John Doe',
    username: 'johnny',
    profilePic: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    id: '3',
    name: 'Jane Smith',
    username: 'jane_smith',
    profilePic: 'https://randomuser.me/api/portraits/women/25.jpg',
  },
];

export function getUserById(id: string | undefined) {
  return users.find((user) => user.id === id);
}
