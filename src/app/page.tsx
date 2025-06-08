
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from '@/components/auth/AppProviders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy, LogIn, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function HomePage() {
  const { session, signIn } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (session.status === 'authenticated') {
      router.push('/tickets');
    }
  }, [session.status, router]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    const result = await signIn(data.email, data.password);
    if (!result.success) {
      toast({
        title: 'Falha no Login',
        description: result.error || 'Ocorreu um erro ao tentar fazer login.',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };
  
  if (session.status === 'loading' || session.status === 'authenticated') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-secondary">
        <LifeBuoy className="h-16 w-16 text-primary mb-6 animate-pulse" />
        <p className="text-xl text-foreground">Carregando aplicação...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary">
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <LifeBuoy className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold font-headline text-primary">
              BBMNET Suporte
            </CardTitle>
            <CardDescription className="text-lg">
              Acesse sua conta para gerenciar os tickets.
              Use um e-mail cadastrado em "Cadastros {'>'} Usuários".
              A senha é "registrada" mas não verificada neste protótipo.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register('email')}
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  {...register('password')}
                  disabled={isSubmitting}
                />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full font-headline" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}
                Entrar
              </Button>
              {session.error && (
                  <p className="mt-3 text-sm text-center text-destructive">{session.error}</p>
              )}
            </CardFooter>
          </form>
        </Card>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} BBMNET. Todos os direitos reservados.
      </footer>
    </div>
  );
}
