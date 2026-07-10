export interface UserDTO {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN' | 'COUNSELOR';
  createdAt: Date;
}
