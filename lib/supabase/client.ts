// lib/supabase/client.ts

import { createClient } from '@supabase/supabase-js';

// NOTA: En un proyecto Next.js, estas variables se cargan automáticamente
// desde el archivo .env.local o a través de la configuración del entorno de despliegue.
// Debes asegurarte de que estén configuradas correctamente.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY deben estar definidas.'
  );
}

// Inicializa el cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// NOTA IMPORTANTE: Para usar esta función en los API Routes (Server Side), 
// es mejor crear un cliente separado que use la Service Role Key (más segura) 
// y que solo se ejecute en el servidor, no exponer la Service Role Key al cliente.
// El cliente de API Route debe ser inicializado SIN el prefijo NEXT_PUBLIC_ en sus claves.