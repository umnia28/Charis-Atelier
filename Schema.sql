CREATE EXTENSION IF NOT EXISTS citext;


CREATE TABLE users (
  user_id        BIGSERIAL PRIMARY KEY,
  username       VARCHAR(60) NOT NULL UNIQUE,
  email          CITEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  contact_no     VARCHAR(30),
  profile_img    TEXT,
  full_name      VARCHAR(120),
  gender         VARCHAR(20),
  status         VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin (
  user_id         BIGINT PRIMARY KEY
                 REFERENCES users(user_id) ON DELETE CASCADE,
  clearance_level INT NOT NULL DEFAULT 1,
  is_employee     BOOLEAN NOT NULL DEFAULT TRUE,
  hire_date       DATE
);

CREATE TABLE customer (
  user_id BIGINT PRIMARY KEY
          REFERENCES users(user_id) ON DELETE CASCADE,
  points  INT NOT NULL DEFAULT 0
);



CREATE TABLE seller (
  user_id        BIGINT PRIMARY KEY
                 REFERENCES users(user_id) ON DELETE CASCADE,

  approved_by    BIGINT NOT NULL
                 REFERENCES admin(user_id) ON DELETE RESTRICT,

  approved_at    TIMESTAMPTZ,  

  business_name  VARCHAR(160) NOT NULL,
  kyc_status     VARCHAR(30) NOT NULL DEFAULT 'pending',
  rating_avg     NUMERIC(3,2) NOT NULL DEFAULT 0.00
);


CREATE TABLE delivery_man (
  user_id      BIGINT PRIMARY KEY
               REFERENCES users(user_id) ON DELETE CASCADE,
  joining_date DATE,
  salary       NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_orders INT NOT NULL DEFAULT 0
);


CREATE TABLE user_image (
  image_id   BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_image_user ON user_image(user_id);

CREATE TABLE notification (
  notification_id          BIGSERIAL PRIMARY KEY,
  user_id                  BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  notification_description TEXT NOT NULL,
  seen_status              BOOLEAN NOT NULL DEFAULT FALSE,
  time_added               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_user_time ON notification(user_id, time_added DESC);


CREATE TABLE shipping_address (
  address_id        BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  city              VARCHAR(80),
  address           TEXT NOT NULL,
  shipping_state    VARCHAR(80),
  zip_code          VARCHAR(20),
  country           VARCHAR(80),
  visibility_status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipping_address_user ON shipping_address(user_id);


CREATE TABLE noticeboard (
  notice_id          BIGSERIAL PRIMARY KEY,
  admin_user_id      BIGINT NOT NULL REFERENCES admin(user_id) ON DELETE RESTRICT,
  notice_description TEXT NOT NULL,
  date_added         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_noticeboard_admin_time ON noticeboard(admin_user_id, date_added DESC);

CREATE TABLE store (
  store_id     BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES seller(user_id) ON DELETE CASCADE,
  store_name   VARCHAR(160) NOT NULL,
  store_status VARCHAR(30) NOT NULL DEFAULT 'active',
  ref_no       VARCHAR(80) UNIQUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_store_seller ON store(user_id);


CREATE TABLE category (
  category_id          BIGSERIAL PRIMARY KEY,
  category_name        VARCHAR(120) NOT NULL UNIQUE,
  category_description TEXT,
  category_img         TEXT,
  visibility_status    BOOLEAN NOT NULL DEFAULT TRUE,
  parent_category_id   BIGINT REFERENCES category(category_id) ON DELETE SET NULL
);

CREATE INDEX idx_category_parent ON category(parent_category_id);


CREATE TABLE product (
  product_id          BIGSERIAL PRIMARY KEY,
  store_id            BIGINT NOT NULL REFERENCES store(store_id) ON DELETE CASCADE,
  category_id         BIGINT REFERENCES category(category_id) ON DELETE SET NULL,
  product_name        VARCHAR(200) NOT NULL,
  price               NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  product_description TEXT,
  product_count       INT NOT NULL DEFAULT 0 CHECK (product_count >= 0),
  discount            NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  status              VARCHAR(30) NOT NULL DEFAULT 'active',
  visibility_status   BOOLEAN NOT NULL DEFAULT TRUE,
  date_added          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_store ON product(store_id);
CREATE INDEX idx_product_category ON product(category_id);


CREATE TABLE product_image (
  image_id   BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_image_product ON product_image(product_id);


CREATE TABLE product_attributes (
  product_id      BIGINT NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
  attribute_name  VARCHAR(80) NOT NULL,
  attribute_value VARCHAR(120) NOT NULL,
  new_price       NUMERIC(12,2) CHECK (new_price IS NULL OR new_price >= 0),
  stock           INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sold            INT NOT NULL DEFAULT 0 CHECK (sold >= 0),
  base_spec       BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (product_id, attribute_name, attribute_value)
);

CREATE INDEX idx_product_attr_product ON product_attributes(product_id);

CREATE TABLE wishlist (
  user_id    BIGINT NOT NULL REFERENCES customer(user_id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);


CREATE TABLE product_review (
  review_id    BIGSERIAL PRIMARY KEY,
  product_id   BIGINT NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
  customer_id  BIGINT NOT NULL REFERENCES customer(user_id) ON DELETE CASCADE,
  rating       INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review       TEXT,
  time_added   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, customer_id)
);

CREATE INDEX idx_review_product_time ON product_review(product_id, time_added DESC);


CREATE TABLE product_qa (
  question_id    BIGSERIAL PRIMARY KEY,
  product_id     BIGINT NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
  asked_by       BIGINT NOT NULL REFERENCES customer(user_id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  time_asked     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qa_product_time ON product_qa(product_id, time_asked DESC);

CREATE TABLE product_qa_answer (
  answer_id      BIGSERIAL PRIMARY KEY,
  question_id    BIGINT NOT NULL REFERENCES product_qa(question_id) ON DELETE CASCADE,
  answered_by    BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  item_answered  TEXT NOT NULL,
  time_answered  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qa_answer_question ON product_qa_answer(question_id);


CREATE TABLE promo (
  promo_id         BIGSERIAL PRIMARY KEY,
  admin_user_id    BIGINT NOT NULL REFERENCES admin(user_id) ON DELETE RESTRICT,
  promo_name       VARCHAR(120) NOT NULL UNIQUE,
  promo_status     VARCHAR(30) NOT NULL DEFAULT 'inactive',
  promo_discount   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (promo_discount >= 0),
  promo_start_date DATE,
  promo_end_date   DATE,
  CHECK (promo_end_date IS NULL OR promo_start_date IS NULL OR promo_end_date >= promo_start_date)
);

CREATE INDEX idx_promo_admin ON promo(admin_user_id);


CREATE TABLE "order" (
  order_id                BIGSERIAL PRIMARY KEY,
  customer_id             BIGINT NOT NULL REFERENCES customer(user_id) ON DELETE RESTRICT,
  address_id              BIGINT REFERENCES shipping_address(address_id) ON DELETE SET NULL,
  delivery_man_id         BIGINT REFERENCES delivery_man(user_id) ON DELETE SET NULL,
  promo_id                BIGINT REFERENCES promo(promo_id) ON DELETE SET NULL,

  date_added              TIMESTAMPTZ NOT NULL DEFAULT now(),
  payment_method          VARCHAR(30),
  payment_status          VARCHAR(30) NOT NULL DEFAULT 'pending',
  delivery_charge         NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (delivery_charge >= 0),
  discount_amount         NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total_price             NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_price >= 0),
  transaction_id          VARCHAR(120),
  delivery_time           TIMESTAMPTZ,
  reason_for_cancellation TEXT
);

CREATE INDEX idx_order_customer_time ON "order"(customer_id, date_added DESC);
CREATE INDEX idx_order_delivery_man  ON "order"(delivery_man_id);
CREATE INDEX idx_order_address       ON "order"(address_id);


CREATE TABLE order_item (
  order_item_id     BIGSERIAL PRIMARY KEY,
  order_id          BIGINT NOT NULL REFERENCES "order"(order_id) ON DELETE CASCADE,
  product_id        BIGINT NOT NULL REFERENCES product(product_id) ON DELETE RESTRICT,
  qty               INT NOT NULL CHECK (qty > 0),
  price             NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  discount_amount   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  seller_earnings   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (seller_earnings >= 0)
);

CREATE INDEX idx_order_item_order   ON order_item(order_id);
CREATE INDEX idx_order_item_product ON order_item(product_id);


CREATE TABLE order_status (
  order_status_id BIGSERIAL PRIMARY KEY,
  order_id        BIGINT NOT NULL REFERENCES "order"(order_id) ON DELETE CASCADE,
  status_type     VARCHAR(40) NOT NULL,
  status_time     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by      BIGINT REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_order_status_order_time ON order_status(order_id, status_time DESC);


CREATE TABLE tracker (
  tracker_id              BIGSERIAL PRIMARY KEY,
  order_id                BIGINT NOT NULL UNIQUE REFERENCES "order"(order_id) ON DELETE CASCADE,
  tracker_description     TEXT,
  progress                VARCHAR(60),
  estimated_delivery_date DATE
);


CREATE TABLE payout (
  payout_id     BIGSERIAL PRIMARY KEY,
  seller_id     BIGINT NOT NULL REFERENCES seller(user_id) ON DELETE RESTRICT,
  store_id      BIGINT REFERENCES store(store_id) ON DELETE SET NULL,
  payout_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  payout_date   TIMESTAMPTZ,
  amount        NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  method        VARCHAR(40),
  reference_no  VARCHAR(120)
);

CREATE INDEX idx_payout_seller_date ON payout(seller_id, payout_date DESC);

CREATE TABLE payout_item (
  payout_id     BIGINT NOT NULL REFERENCES payout(payout_id) ON DELETE CASCADE,
  order_item_id BIGINT NOT NULL REFERENCES order_item(order_item_id) ON DELETE RESTRICT,
  PRIMARY KEY (payout_id, order_item_id)
);
