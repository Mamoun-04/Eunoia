// Define login schema at the top of the file
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

function LoginForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(8, "Password must be at least 8 characters")
  });

  const form = useForm({
    resolver: zodResolver(z.object({
      username: insertUserSchema.shape.username,
      password: insertUserSchema.shape.password
    })),
  });
}