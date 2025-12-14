-- 1. ROLES
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- 'super_admin', 'gym_owner', 'trainer', 'client'
    description TEXT
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
('super_admin', 'Administrator with full access'),
('gym_owner', 'Owner of a gym, manages trainers and clients'),
('trainer', 'Gym trainer, manages routines and diets'),
('client', 'Gym user, tracks progress and routines');

-- 2. GYMS
CREATE TABLE gyms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. USERS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role_id INT,
    gym_id INT,
    profile_picture_url TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE SET NULL
);

-- 4. EXERCISES (Global Catalog)
CREATE TABLE exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    muscle_group VARCHAR(50), -- 'chest', 'back', 'legs', etc.
    equipment_needed VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. ROUTINES
CREATE TABLE routines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    creator_id INT,
    assigned_user_id INT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id),
    FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. ROUTINE EXERCISES (Details)
CREATE TABLE routine_exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    routine_id INT,
    exercise_id INT,
    day_of_week INT, -- 1=Monday, 7=Sunday
    sets INT,
    reps_min INT,
    reps_max INT,
    target_weight DECIMAL(5,2), -- kg/lbs
    rest_seconds INT,
    notes TEXT,
    order_index INT,
    FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

-- 7. WORKOUT LOGS (Tracking)
CREATE TABLE workout_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    routine_id INT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    duration_minutes INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (routine_id) REFERENCES routines(id)
);

CREATE TABLE workout_sets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_log_id INT,
    exercise_id INT,
    set_number INT,
    reps_completed INT,
    weight_used DECIMAL(5,2),
    rpe INT, -- Rate of Perceived Exertion (1-10)
    FOREIGN KEY (workout_log_id) REFERENCES workout_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

-- 8. MEASUREMENTS
CREATE TABLE measurements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    date DATE DEFAULT (CURRENT_DATE),
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    muscle_mass_percentage DECIMAL(4,2),
    chest_cm DECIMAL(5,2),
    waist_cm DECIMAL(5,2),
    hips_cm DECIMAL(5,2),
    biceps_left_cm DECIMAL(5,2),
    biceps_right_cm DECIMAL(5,2),
    thigh_left_cm DECIMAL(5,2),
    thigh_right_cm DECIMAL(5,2),
    photos_front_url TEXT,
    photos_side_url TEXT,
    photos_back_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. DIETS
CREATE TABLE diets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    creator_id INT,
    assigned_user_id INT,
    start_date DATE,
    end_date DATE,
    daily_calories_target INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id),
    FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE diet_meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diet_id INT,
    name VARCHAR(50), -- 'Breakfast', 'Lunch'
    time_of_day TIME,
    description TEXT,
    calories INT,
    protein_g DECIMAL(5,1),
    carbs_g DECIMAL(5,1),
    fats_g DECIMAL(5,1),
    FOREIGN KEY (diet_id) REFERENCES diets(id) ON DELETE CASCADE
);

-- 10. SOCIAL
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT,
    user_id INT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE likes (
    post_id INT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE follows (
    follower_id INT,
    following_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);
