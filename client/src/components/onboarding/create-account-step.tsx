
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const createAccountSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type CreateAccountForm = z.infer<typeof createAccountSchema>;

export function CreateAccountStep() {
  const [, setLocation] = useLocation();
  const { registerMutation } = useAuth();
  const [serverError, setServerError] = useState('');
  
  const form = useForm<CreateAccountForm>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: CreateAccountForm) => {
    try {
      setServerError('');
      await registerMutation.mutateAsync({
        username: data.username,
        password: data.password,
        email: data.email
      });
      setLocation('/');
    } catch (error) {
      setServerError('Account creation failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Create Your Account</h1>
        <p className="text-muted-foreground">Set up your Eunoia account to get started</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Email"
            type="email"
            {...form.register('email')}
            aria-invalid={!!form.formState.errors.email}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            placeholder="Username"
            {...form.register('username')}
            aria-invalid={!!form.formState.errors.username}
          />
          {form.formState.errors.username && (
            <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            placeholder="Password"
            type="password"
            {...form.register('password')}
            aria-invalid={!!form.formState.errors.password}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            placeholder="Confirm Password"
            type="password"
            {...form.register('confirmPassword')}
            aria-invalid={!!form.formState.errors.confirmPassword}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-destructive text-center">{serverError}</p>
        )}

        <Button 
          type="submit" 
          className="w-full"
          disabled={registerMutation.isLoading}
        >
          {registerMutation.isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </div>
  );
}
