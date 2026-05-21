-- ============================================
-- LOUVOR 24/7 - SUPABASE DATABASE SCHEMA
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: musicas
-- ============================================
CREATE TABLE IF NOT EXISTS musicas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cantor VARCHAR(255) NOT NULL,
    link TEXT NOT NULL,
    tonalidade VARCHAR(10),
    categoria VARCHAR(50) NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_musicas_categoria ON musicas(categoria);
CREATE INDEX IF NOT EXISTS idx_musicas_cantor ON musicas(cantor);
CREATE INDEX IF NOT EXISTS idx_musicas_created_at ON musicas(created_at DESC);

-- Add RLS (Row Level Security)
ALTER TABLE musicas ENABLE ROW LEVEL SECURITY;

-- Public can read music
CREATE POLICY "Public can read music" ON musicas
    FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated can insert music" ON musicas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update music" ON musicas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete music" ON musicas
    FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- TABLE: noticias
-- ============================================
CREATE TABLE IF NOT EXISTS noticias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    imagem TEXT,
    autor VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_noticias_created_at ON noticias(created_at DESC);

-- Add RLS
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;

-- Public can read news
CREATE POLICY "Public can read news" ON noticias
    FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated can insert news" ON noticias
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update news" ON noticias
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete news" ON noticias
    FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- TABLE: admins
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Only service role can manage admins
CREATE POLICY "Service can manage admins" ON admins
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- TABLE: configuracoes
-- ============================================
CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    descricao TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default configurations
INSERT INTO configuracoes (chave, valor, descricao) VALUES
    ('youtube_playlist_id', '', 'ID da playlist oficial do YouTube'),
    ('whatsapp_group_id', '', 'ID do grupo do WhatsApp para notificações'),
    ('whatsapp_provider', 'zapi', 'Provedor de WhatsApp: zapi ou twilio')
ON CONFLICT (chave) DO NOTHING;

-- Add RLS
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read config
CREATE POLICY "Authenticated can read config" ON configuracoes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can update config
CREATE POLICY "Service can update config" ON configuracoes
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- TABLE: acessos
-- ============================================
CREATE TABLE IF NOT EXISTS acessos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ip_address VARCHAR(45),
    user_agent TEXT,
    pagina VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_acessos_created_at ON acessos(created_at DESC);

-- Add RLS
ALTER TABLE acessos ENABLE ROW LEVEL SECURITY;

-- Public can insert access logs
CREATE POLICY "Public can insert access" ON acessos
    FOR INSERT WITH CHECK (true);

-- Only service role can read access logs
CREATE POLICY "Service can read access" ON acessos
    FOR SELECT USING (auth.role() = 'service_role');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_musicas_updated_at BEFORE UPDATE ON musicas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_noticias_updated_at BEFORE UPDATE ON noticias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS
-- ============================================

-- View for music statistics
CREATE OR REPLACE VIEW music_stats AS
SELECT 
    COUNT(*) as total_musicas,
    COUNT(DISTINCT categoria) as total_categorias,
    COUNT(DISTINCT cantor) as total_cantores
FROM musicas;

-- View for recent music
CREATE OR REPLACE VIEW recent_music AS
SELECT 
    id,
    nome,
    cantor,
    categoria,
    tonalidade,
    created_at
FROM musicas
ORDER BY created_at DESC
LIMIT 10;

-- View for recent news
CREATE OR REPLACE VIEW recent_news AS
SELECT 
    id,
    titulo,
    autor,
    created_at
FROM noticias
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- SAMPLE DATA (Optional - for development)
-- ============================================

-- Insert sample music
INSERT INTO musicas (nome, cantor, link, tonalidade, categoria, observacoes) VALUES
    ('Aos Pés do Altar', 'Diante do Trono', 'https://www.youtube.com/watch?v=example1', 'G', 'adoracao', 'Música de abertura'),
    ('Meu Abrigo', 'Vineyard', 'https://www.youtube.com/watch?v=example2', 'D', 'congregacao', 'Música de congregação'),
    ('Santo Espírito', 'Diante do Trono', 'https://www.youtube.com/watch?v=example3', 'E', 'especial', 'Para momentos especiais')
ON CONFLICT DO NOTHING;

-- Insert sample news
INSERT INTO noticias (titulo, conteudo, imagem, autor) VALUES
    ('Culto Especial de Louvor', 'Venha celebrar conosco neste culto especial de louvor. Teremos momentos de adoração profunda e comunhão.', 'https://via.placeholder.com/400x200', 'Admin'),
    ('Nova Música Adicionada', 'Adicionamos uma nova música ao nosso repertório. Confira na seção de playlist.', 'https://via.placeholder.com/400x200', 'Admin')
ON CONFLICT DO NOTHING;

-- ============================================
-- GRANTS
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
