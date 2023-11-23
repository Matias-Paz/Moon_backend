-- Crear la base de datos
DROP DATABASE IF EXISTS gamesBase;
CREATE DATABASE IF NOT EXISTS gamesBase;
use gamesBase;

CREATE TABLE genres (
    genres_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    _name VARCHAR(50) NOT NULL
);

CREATE TABLE company (
    company_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    _name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    img VARCHAR(255) DEFAULT 'default.webp',
    offer INT NOT NULL,
    price INT NOT NULL,
    stock INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    rating DECIMAL(3, 1) NOT NULL,
    release_date DATE NOT NULL,
    short_description TEXT NOT NULL,
    publishers_id INT NOT NULL,
    developers_id INT NOT NULL,
	FOREIGN KEY (publishers_id) REFERENCES company (company_id),
	FOREIGN KEY (developers_id) REFERENCES company (company_id)
);

CREATE TABLE games_genres (
    games_id INT NOT NULL,
    genres_id INT NOT NULL,
    FOREIGN KEY (games_id) REFERENCES games(id),
    FOREIGN KEY (genres_id) REFERENCES genres(genres_id),
    PRIMARY KEY (games_id, genres_id)
);

INSERT INTO company (_name) VALUES
('Activision Blizzard'),
('Amazon Games'),
('Warner Bros'),
('Blizzard Entertainment'),
('KRAFTON, Inc.'),
('InnoGames'),
('Bigpoint'),
('Player First Games'),
('miHoYo'),
('Mediatonic'),
('YOOZOO Games'),
('Cryptic Studios'),
('R2 Games'),
('Gala Lab'),
('Sega'),
('Gaijin'),
('Wargaming'),
('NetherRealm Studios'),
('The Vanishing'),
('Smilegate RPG'),
('Darkflow Software'),
('343 Industries'),
('GTArcade'),
('Perfect World Entertainment'),
('Xbox Game Studios'),
('Targem'),
('The Astronauts');


-- Insertar el juego en la tabla games con los IDs obtenidos de los publishers y developers
INSERT INTO games (img, offer, price, stock, title, rating, release_date, short_description, publishers_id, developers_id)
VALUES 
('overwatch-2.webp', 15,5000, 25, 'Overwatch 2', 4.5, '2022-10-04', 'Un shooter de equipo en primera persona centrado en héroes de Blizzard Entertainment.', 1, 4),
('diablo.webp', 25, 7000, 20, 'Diablo Immortal', 4.3, '2022-06-02', 'Construido para móviles y también lanzado en PC, Diablo Immortal completa los vacíos entre Diablo II y III en un entorno MMOARPG.', 1, 1),
('lost-ark.webp', 50, 6750, 18, 'Lost Ark', 4.7, '2022-02-11', 'El ARPG multijugador gratuito de Smilegate es una aventura masiva llena de tierras esperando ser exploradas, personas esperando ser conocidas y un antiguo mal esperando ser destruido.', 2, 20),
('pubg.webp', 30, 7250, 15, 'PUBG: BATTLEGROUNDS', 4.4, '2022-01-12', 'Entra en acción en uno de los juegos de battle royale más largos de PUBG Battlegrounds.', 5, 5),
('enlisted.webp', 12, 4250, 12, 'Enlisted', 4.2, '2021-04-08', 'Prepárate para comandar tu propio escuadrón militar de la Segunda Guerra Mundial en el shooter basado en escuadrones MMO de Gaijin y Darkflow Software, Enlisted.', 16, 21),
('forge-of-empires.webp', 20, 5500, 10, 'Forge of Empires', 4.1, '2012-04-17', 'Un juego de estrategia en línea gratuito basado en navegador en 2D, conviértete en el líder y levanta tu ciudad.', 6, 6),
('drakensang.webp', 18, 4500, 8, 'Drakensang Online', 4, '2011-08-08', 'Un MMORPG en 3D de arriba abajo basado en navegador y gratuito similar a los juegos de la serie Diablo.', 7, 7),
('multi-versus.webp', 15, 4000, 5, 'MultiVersus', 3.9, '2022-07-19', 'La alineación de Warner Bros se encuentra con Smash en el MultiVersus de Player First Games.', 3, 8),
('genshin-impact.webp', 18, 6250, 15, 'Genshin Impact', 4.5, '2020-09-28', 'Si has estado buscando un juego para satisfacer ese picor de RPG de acción de mundo abierto, con un poco de sabor asiático, entonces querrás echar un vistazo a Genshin Impact de miHoYo.', 9, 9),
('fallguys.webp', 20, 5500, 12, 'Fall Guys', 4.3, '2020-08-04', 'Juega el juego de battle royale masivo multijugador más competitivo con frijoles de la historia de los videojuegos de forma gratuita en una variedad de plataformas.', 10, 10),
('winteriscoming.webp', 15, 4750, 10, 'Game Of Thrones Winter Is Coming', 3.8, '2019-11-14', 'Un RTS basado en navegador y gratuito basado en los libros de George R.R. Martin y la popular serie de HBO.', 23, 11),
('elvenar.webp', 12, 4250, 8, 'Elvenar', 3.7, '2015-04-08', 'Un MMO de estrategia basado en navegador en 2D ambientado en el mundo de fantasía de Elvenar.', 6, 6),
('neverwinter.webp', 10, 4000, 5, 'Neverwinter', 3.6, '2013-12-06', 'Un MMORPG de acción en 3D gratuito basado en el aclamado juego de rol de fantasía Dungeons & Dragons.', 24, 12),
('dark-orbit-reloaded.webp', 15, 4500, 3, 'Dark Orbit Reloaded', 3.5, '2006-12-11', 'Un MMO de combate espacial en 3D basado en navegador con una gran base de jugadores.', 7, 7),
('halo-Infinite.webp', 12, 4750, 8, 'Halo Infinite', 4, '2021-11-15', 'Por primera vez, una experiencia de juego gratuito de Halo está disponible en forma de multijugador de Halo Infinite.', 25, 22),
('eternal-fury.webp', 18, 5750, 10, 'Eternal Fury', 3.9, '2019-05-21', 'Un ARPG gratuito de R2 Games.', 13, 13),
('flyff-universe.webp', 20, 6250, 12, 'Flyff Universe', 4.2, '2022-06-14', 'Obtén la experiencia completa de Flyff en cualquier plataforma con el MMORPG basado en navegador gratuito Flyff Universe.', 14, 14),
('new-genesis.webp', 25, 6750, 15, 'Phantasy Star Online 2 New Genesis', 4.4, '2021-06-09', '¡El legado de Phantasy Star Online 2 continúa mil años después!', 15, 15),
('crossout.webp', 30, 7250, 18, 'Crossout', 4.5, '2017-05-30', '¡Un juego de combate de vehículos MMO postapocalíptico!', 26, 16),
('worships.webp', 25, 6500, 20, 'World of Warships', 4.7, '2015-07-02', '¡Un MMO de acción naval en 3D gratuito de los creadores de World of Tanks!', 17, 17),
('mortal-1.webp', 0, 10000, 25, 'Mortal Kombat 1', 5, '2023-10-12', 'Es un juego de lucha en el que los jugadores eligen uno de los personajes disponibles y compiten en combates uno contra uno contra otros personajes controlados por la computadora o por otros jugadores.', 3, 18),
('witchfire.webp', 0, 12000, 25, 'Witchfire', 5, '2023-10-12', 'Es un videojuego de acción en primera persona de fantasía oscura mezclando con elementos del steampunk.', 27, 19);



INSERT INTO genres (_name) VALUES
('Shooter'),
('Acción'),
('Multiplayer'),
('MMOARPG'),
('Aventura'),
('ARPG'),
('Estrategia'),
('Simulación'),
('MMORPG'),
('Lucha'),
('RPG de Acción'),
('Fantasía'),
('Battle Royale');


INSERT INTO games_genres (games_id, genres_id) VALUES
(1, 1),
(1, 2),
(1, 5),
(2, 3),
(2, 4),
(2, 5),
(3, 6),
(3, 2),
(3, 5),
(4, 1),
(4, 2),
(4, 3),
(5, 1),
(5, 2),
(5, 3),
(6, 7),
(6, 8),
(6, 3),
(7, 4),
(7, 2),
(7, 5),
(8, 2),
(8, 3),
(8, 10),
(9, 5),
(9, 11),
(9, 12),
(10, 13),
(10, 2),
(10, 3),
(11, 7),
(11, 8),
(11, 3),
(12, 7),
(12, 8),
(12, 3),
(13, 4),
(13, 2),
(13, 12),
(14, 1),
(14, 2),
(14, 8),
(15, 1),
(15, 2),
(15, 3),
(16, 4),
(16, 2),
(16, 5),
(17, 4),
(17, 2),
(17, 12),
(18, 9),
(18, 2),
(18, 12),
(19, 1),
(19, 2),
(19, 8),
(20, 1),
(20, 2),
(20, 8),
(21, 10),
(21, 2),
(21, 3),
(22, 10),
(22, 2),
(22, 3);