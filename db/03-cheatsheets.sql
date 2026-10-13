-- ============================================================================
-- Mock cheat-sheet catalogue -- loaded so the lab UI looks like a populated
-- marketplace. Titles/descriptions are sample data; every file path, video
-- link and external URL is a placeholder. No real PDFs are included -- every
-- download is served the local mock (uploads/sample-cheatsheet.pdf) via the
-- API's file fallback. Preview thumbnails are low-res blurred images served
-- from web/public/previews.
--   * institution_id = 1 (SIIT), seeded in 02-seed.sql.
-- Educational / isolated use only (CSS484 Assessment 3).
-- ============================================================================

INSERT INTO cheat_sheets (cheatsheet_id, title, description, course_code, semester, academic_year, year_level, exam_type, price, file_path, file_hash, file_version, file_version_history, file_size_mb, page_count, preview_image_path, preview_text, youtube_links, exclusive_content, is_active, is_sponsored, sponsored_at, approval_status, approved_by, approved_at, rejection_reason, view_count, purchase_count, created_by, institution_id, release_at, created_at, updated_at, full_preview_enabled, full_preview_generated_at, institution_restricted, preview_3d_front_path, preview_3d_back_path, exam_types) VALUES (17, 'Artificial Intelligence (AI)', '## Artificial Intelligence by Aj. Cholwich
> จริง ๆ ตอนนั้นสามารถเอาเข้าได้ 2 แผ่น แต่ว่าไม่รู้55555 ก็เลยทำมาแค่แผ่นเดียว แต่ว่าเนื้อหาครบ ดีที่สุดเท่าที่มีมา
- **แถมคลิปสอน Alpha-Beta Pruning + First-Order Logic ที่เข้าใจยากแสนยากให้เป็นเรื่องง่าย (รึเปล่า)** สนุกม้ากกก
### Contents
1. Chapter 1 - Introduction to AI
2. Chapter 2 - Search
3. Chapter 3 - Uninformed Search
4. Chapter 4 - Informed Search
5. Chapter 5 - Local Search
6. Chapter 6 - Adversarial Search
7. Chapter 7 - First-Order Logic
- แถม Homework + Practice Midterm Exam + Code ที่อาจจะเจอ', 'CSS324', '1', '2025', 'Year 3', 'Midterm', '100.00', 'cheatsheets/mock-001.pdf', null, 1, null, '29.52', 2, 'http://localhost:3000/previews/preview-039.jpg', null, '["https://youtu.be/MOCK0000001","https://youtu.be/MOCK0000002"]', null, true, false, null, 'approved', 1, '2025-10-13 21:25:39', null, 195, 22, 1, 1, null, '2025-10-13 21:24:59', '2026-10-03 14:51:47.516242', false, null, false, null, null, ARRAY['Midterm']), (18, 'Scientific Computing', '## Scientific Computing ของดี Dr.Gun
- **แถมคลิปอธิบายการใช้ Cheat Sheet** พาร์ทหลัง ๆ พาร์ทแรกไม่มี5555 พูดไม่รู้เรื่อง ขออภัยด้วย
- เนื่องจากพื้นที่มันเหลือ แถมเนื้อร้อง All Too Well 10 ไปให้ด้วย อย่าลืมร้องตอนสุดท้ายก่อนออกห้อง
สอบ 10 นาที', 'CSS322', '1', '2025', 'Year 3', 'Midterm', '79.00', 'cheatsheets/mock-002.pdf', null, 1, null, '33.41', 4, 'http://localhost:3000/previews/preview-040.jpg', null, '["https://youtu.be/MOCK0000003"]', null, true, false, null, 'approved', 1, '2025-10-13 14:33:27', null, 155, 11, 1, 1, null, '2025-10-13 14:33:11', '2026-10-06 05:58:23.784676', false, null, false, null, null, ARRAY['Midterm']), (19, 'Fundamentals of Data Communications', '- อาจารย์อนุญาตให้เขียนมือเท่านั้น และเข้าได้ **1 แผ่น** แต่ตอนออกแบบเลยไปนิดหน่อยย', 'CSS331', '1', '2025', 'Year 3', 'Midterm', '125.00', 'cheatsheets/mock-003.pdf', null, 1, null, '70.18', 3, 'http://localhost:3000/previews/preview-041.jpg', null, null, null, true, false, null, 'approved', 1, '2025-10-13 14:45:31', null, 138, 10, 1, 1, null, '2025-10-13 14:45:18', '2026-10-03 14:51:47.960342', false, null, false, null, null, ARRAY['Midterm']), (20, 'Theory of Computation (Open Book)', '**ไฟล์พร้อมพรินต์!!**
- slide ที่เรียนทั้งหมด(มิดเทอม)
- หนังสือ
- เฉลยหนังสือ
- Midterm Practice 1-4
- เฉลยการบ้าน', 'CSS321', '1', '2025', 'Year 3', 'Midterm', '0.00', 'cheatsheets/mock-004.pdf', null, 1, null, '49.07', 151, 'http://localhost:3000/previews/preview-016.jpg', null, null, null, true, false, null, 'approved', 1, '2025-10-13 15:19:00', null, 193, 38, 2, 1, null, '2025-10-13 15:08:30', '2026-10-03 14:51:48.128458', false, null, false, null, null, ARRAY['Midterm']), (21, 'Introduction to Computers and Programming (Python)', '- ฝึกทำ [Practice Quiz + Lab](https://example.com/lab-repo) เยอะ ๆ เข้าใจเนื้อหาน่าจะได้
- ใส่มาน่าจะเกือบทุกอย่าง555 จำไม่ได้แล้ว
- หน้าหลัง ซ้ายบน จำได้ว่าได้ใช้อยู่ Error ประเภทไหน ใส่มาหมดละ
- เหลือที่ว่างเยอะพอสมควร ลองจัด ใส่อะไรเพิ่มเติมได้เลยยย', 'GTS123', '1', '2023', 'Year 1', 'Midterm', '30.00', 'cheatsheets/mock-005.pdf', null, 1, null, '11.70', 2, 'http://localhost:3000/previews/preview-042.jpg', null, null, null, true, false, null, 'approved', 1, '2025-10-19 09:05:24', null, 76, 8, 1, 1, null, '2025-10-19 09:04:48', '2026-10-03 14:51:48.303769', false, null, false, null, null, ARRAY['Midterm']), (22, 'General Science (Chemistry)', '- ชัดแจ๋วทุกอย่าง สวยงามม
- เนื้อหาครบ (ส่วนท้าย ๆ ไม่รู้จะสรุปยังไงเลยใส่ Slide มาเลย)
- การอ่านชื่อ Isomer เอาของอาจารย์อุ๊มา 5555 (เนื้อหามอปลาย)', 'SCS141', '1', '2023', 'Year 1', 'Midterm', '35.00', 'cheatsheets/mock-006.pdf', null, 1, null, '7.22', 2, 'http://localhost:3000/previews/preview-043.jpg', null, null, null, true, false, null, 'approved', 1, '2025-10-19 09:11:33', null, 101, 7, 1, 1, null, '2025-10-19 09:11:24', '2026-10-09 10:28:05.54092', false, null, false, null, null, ARRAY['Midterm']), (23, 'Introduction to Computers and Programming (Python)', '- ส่วน Midterm อะไรที่สำคัญก็ใส่มาให้ด้วย
- สรุปเนื้อหาสำคัญต่าง ๆ ที่เรียน Final
- มันดีมาก ๆ เลยล่ะะะะ', 'GTS123', '1', '2023', 'Year 1', 'Final', '50.00', 'cheatsheets/mock-007.pdf', null, 1, null, '9.27', 2, 'http://localhost:3000/previews/preview-044.jpg', null, null, null, true, false, null, 'approved', 1, '2025-10-19 09:16:59', null, 50, 2, 1, 1, null, '2025-10-19 09:16:48', '2026-10-03 14:51:48.631785', false, null, false, null, null, ARRAY['Final']), (24, 'Computer Architectures', '- ข้อสอบทำสนุกมาก
- พาร์ท Cache คือง่ายมาก แต่ตอนเขียน Cheat Sheet เข้าไปสลับ 0, 1 เลยพัง แต่ Version นี้แก้ให้แล้วนะ ๆ (ฝากเช็คอีกที55555)
- ด้านหลังยังเหลือที่เกือบ 1 Column ใส่อะไรเพิ่มได้เยอะ', 'CSS224', '1', '2023', 'Year 1', 'Final', '50.00', 'cheatsheets/mock-008.pdf', null, 1, null, '4.70', 2, 'http://localhost:3000/previews/preview-045.jpg', null, null, null, true, false, null, 'approved', 1, '2025-10-21 18:46:47', null, 75, 6, 1, 1, null, '2025-10-21 18:45:31', '2026-10-03 14:51:48.824902', false, null, false, null, null, ARRAY['Final']), (25, 'Artificial Intelligence and Applications', '- จำอะไรไม่ได้ละ', 'GTS124', '1', '2023', 'Year 1', 'Final', '40.00', 'cheatsheets/mock-009.pdf', null, 1, null, '12.89', 4, 'http://localhost:3000/previews/preview-046.jpg', null, null, null, true, false, null, 'approved', 1, '2025-10-21 18:51:42', null, 100, 1, 1, 1, null, '2025-10-21 18:51:37', '2026-10-03 14:51:48.986291', false, null, false, null, null, ARRAY['Final']), (26, 'Technical Writing (Final Mnemonics)', '- คลิปหลัก การจำ Structure หลัก ๆ ในการเขียน
- แถมคลิปวีดีโอ 18 ตัว (4 คาบ, 7 เล่าถึงอาหารไทย การเขียน, อีก 7 Cooking Vocab)', 'GTS302', '1', '2025', 'Year 3', 'Final', '120.00', 'cheatsheets/mock-010.pdf', null, 1, null, '0.03', null, null, null, '["https://youtu.be/MOCK0000004","https://youtu.be/MOCK0000005","https://youtu.be/MOCK0000006","https://youtu.be/MOCK0000007","https://youtu.be/MOCK0000008","https://youtu.be/MOCK0000009","https://youtu.be/MOCK0000010","https://youtu.be/MOCK0000011","https://youtu.be/MOCK0000012","https://youtu.be/MOCK0000013","https://youtu.be/MOCK0000014","https://youtu.be/MOCK0000015","https://youtu.be/MOCK0000016","https://youtu.be/MOCK0000017","https://youtu.be/MOCK0000018","https://youtu.be/MOCK0000019","https://youtu.be/MOCK0000020","https://youtu.be/MOCK0000021","https://youtu.be/MOCK0000022","https://youtu.be/MOCK0000023","https://youtu.be/MOCK0000024"]', null, true, false, null, 'approved', 1, '2025-11-04 09:54:25', null, 25, 1, 1, 1, null, '2025-11-04 09:54:08', '2026-10-11 04:40:04.990202', false, null, false, null, null, ARRAY['Final']), (27, 'Things You Should Know Before Taking Graded Writing 2 (GTS302)', '# Technical Writing (Graded Writing 2 - Recipe)
- คลิปหลัก: Things You Should Know Before Taking Graded Writing 2 + เนื้อหาในห้องเรื่อง Instruction เต็ม ๆ
- แถมคลิปการพูดถึงอาหารไทย ใช้ Structure แบบในห้อง (7 คลิป)
- แถมคลิป Vocabulary Verb ในการทำอาหารแปลก ๆ มากมาย 100 คำ (10 คลิป)
- เว็บช่วยเรื่องการเขียน [https://example.com](https://example.com) (Username, Password อยู่ในคลิปเลยยย~~)

ไม่รับประกันความถูกต้อง5555 เลิ๊ฟ', 'GTS302', '1', '2025', 'Year 3', 'Quiz', '0.00', 'cheatsheets/mock-011.pdf', null, 1, null, '3.28', 8, 'http://localhost:3000/previews/preview-047.jpg', null, '["https://youtu.be/MOCK0000025","https://youtu.be/MOCK0000026","https://youtu.be/MOCK0000027","https://youtu.be/MOCK0000028","https://youtu.be/MOCK0000029","https://youtu.be/MOCK0000030","https://youtu.be/MOCK0000031","https://youtu.be/MOCK0000032","https://youtu.be/MOCK0000033","https://youtu.be/MOCK0000034","https://youtu.be/MOCK0000035","https://youtu.be/MOCK0000036","https://youtu.be/MOCK0000037","https://youtu.be/MOCK0000038","https://youtu.be/MOCK0000039","https://youtu.be/MOCK0000040","https://youtu.be/MOCK0000041","https://youtu.be/MOCK0000042","https://youtu.be/MOCK0000043"]', null, true, false, null, 'approved', 1, '2025-11-08 08:37:14', null, 243, 25, 1, 1, null, '2025-11-08 08:36:47', '2026-10-03 14:51:49.356514', false, null, false, null, null, ARRAY['Quiz']), (28, 'Technical Writing: Structure Mnemonics for the Writing Part', '# GTS302 Structure Mnemonics for the Writing Part
วิธีการจำ Structure ของการเขียนต่าง ๆ ที่อาจจะเจอได้ใน Final Exam
- เปิดคลิปวนไปซ้ำวนมา เดี๋ยวจำได้เองเด้อ
- แถมคลิปเนื้อหาทั้งหมดของ Final วิชา GTS302 อีก 4 คลิป: Ingredients, Progress Reports, Recommendation Reports, Proposals (ยกเว้นคาบ *Science Lab Reports* อาจจะอัดเร็ว ๆ นี้ถ้ามีเวลา)
- *Update (November 27, 2025)* แก้ไข Memo Header: ต้องเป็น **TO FROM** เสมอ ไม่ใช่ FROM TO นะะะ!! (Sorry สลับกัน5555)', 'GTS302', '1', '2025', 'Year 3', 'Final', '26.00', 'cheatsheets/mock-012.pdf', null, 1, null, '15.70', 5, 'http://localhost:3000/previews/preview-048.jpg', null, '["https://youtu.be/MOCK0000044","https://youtu.be/MOCK0000045","https://youtu.be/MOCK0000046","https://youtu.be/MOCK0000047","https://youtu.be/MOCK0000048"]', null, true, false, null, 'approved', 1, '2025-11-09 09:16:59', null, 109, 6, 1, 1, null, '2025-11-09 09:16:46', '2026-10-03 14:51:49.514067', false, null, false, null, null, ARRAY['Final']), (29, 'Operating System', '- เนื้อหาทั้งหมดใน Part Final (รวมให้หมดทุกอย่าง แต่ว่าต้องมีความรู้ส่วนนึง) ให้คุ้นชิน แต่เนื้อหาครบจริง ๆ ใช้ได้ใน Multiple choice ได้ 100%
- สามารถลองใช้ทำกับ [Mock Exam](https://example.com) ของวิชานี้ได้ มันดีเลยล่ะ', 'CSS225', '2', '2024', 'Year 2', 'Final', '50.00', 'cheatsheets/mock-013.pdf', null, 1, null, '47.66', 2, 'http://localhost:3000/previews/preview-049.jpg', null, null, null, true, false, null, 'approved', 1, '2025-11-10 11:21:56', null, 129, 5, 1, 1, null, '2025-11-10 11:21:29', '2026-10-13 04:58:43.821949', false, null, false, null, null, ARRAY['Final']), (30, 'ALL Scientific Computing for FINAL', '- **แถมคลิปวีดีโอ (2 ชั่วโมงครึ่ง + 40 นาที)** สอนวิธีการใช้ Cheat Sheet และทวนเนื้อหาในทุกบท
- **รวมวิธีการทำทุกอย่างของ Final** เนื้อหาครบทุกบท
  - 8 - Numerical Integration
  - 9 - Numerical Diﬀerentiation
  - 10 - Linear Least Squares
  - 11 - Nonlinear Equations
  - 12 - Optimization
  - 13 - Initial Value Problems for Ordinary Differential Equations (IVP)
  - 14 - Singular Value Decomposition (SVD)
  - 15 - Eigenvalues and Eigenvectors
  - 16 - Boundary Value Problems for Ordinary Differential Equations (BVP)
  - 17 - Partial Differential Equations)

- 2 หน้าแรกเป็นสรุป, 2 หน้าหลังเป็น Example วิธีการทำโจทย์ข้อต่าง ๆ ในห้อง ทั้ง Example ในห้องและการ์บ้าน!', 'CSS322', '1', '2025', 'Year 3', 'Final', '119.00', 'cheatsheets/mock-014.pdf', null, 1, null, '60.31', 4, 'http://localhost:3000/previews/preview-067.jpg', null, '["https://youtu.be/MOCK0000049","https://youtu.be/MOCK0000050"]', null, true, false, null, 'approved', 1, '2025-11-17 09:35:06', null, 204, 5, 1, 1, null, '2025-11-17 09:34:49', '2026-10-11 04:43:15.072614', false, null, false, null, null, ARRAY['Final']), (31, 'hey', 'orijevdig', 'CSSSSS', null, null, null, null, '50.00', 'cheatsheets/mock-015.pdf', null, 1, null, '0.63', 10, null, null, null, null, false, false, null, 'rejected', 1, '2025-11-17 21:31:49', 'It''s too bad', 2, 0, 19, 1, null, '2025-11-17 21:30:51', '2026-09-14 14:55:27.099246', false, null, false, null, null, ARRAY[]::text[]), (32, 'Microcontrollers and Applications', '>แนะนำให้ Print ที่ห้องสมุดหรือ ศกร. (Fun fact ปริ้นสีได้) ชัด - ไฟล์ใหญ่จะไม่สามารถปริ้นกับ Double A ได้
- ไฟล์ใหญ่นิดนึงขออภัย แต่ว่าชัดแจ๋วแน่นอน 100% 
- **ตรงข้อสอบ Final มาก ๆ** โดยเฉพาะในส่วนของการเฉลย [Mock Exam](https://example.com) 
- เนื้อหาครบ ผ่านการเรียบเรียงมาอย่างดี
- ในส่วนของ Code ก็ใส่ Comment ให้เกือบทุกจุด (อาจจะมีให้เขียนว่า Code ส่วนนี้ทำอะไร) ทำได้แน่นอน!!', 'CSS332', '2', '2024', 'Year 2', 'Final', '90.00', 'cheatsheets/mock-016.pdf', null, 1, null, '134.25', 2, 'http://localhost:3000/previews/preview-087.jpg', null, null, null, true, false, null, 'approved', 1, '2025-11-18 11:05:34', null, 247, 28, 1, 1, null, '2025-11-18 11:05:17', '2026-10-05 11:11:03.098362', false, null, false, null, null, ARRAY['Final']), (33, 'LAS101 Final guide book', 'Written by an A-grade student who placed in the Top 3 of the final exam, guide recalled written questions and multiple-choice items from past exams.', 'LAS101', '1', '2025', 'Year 2', 'Final', '67.00', 'cheatsheets/mock-017.pdf', null, 1, null, '3.94', 9, 'http://localhost:3000/previews/preview-126.jpg', null, null, null, true, false, null, 'approved', 1, '2025-11-19 00:17:32', null, 220, 11, 20, 1, null, '2025-11-19 00:14:35', '2026-10-03 14:51:50.413593', false, null, false, null, null, ARRAY['Final']), (34, 'Final Scientific Computing', 'จัดทำโดย Zeer (SIIT32,CPE)
- เรียนกับ Dr.Gun Srijuntongsiri
- **ทำเพื่อเอาตัวรอดเท่านั้น**
- Organize แบบรีบ ๆ 
- ภาพ Preview คือจุดที่ผมคิดว่ารกที่สุด ถ้าพออ่านออก แสดงว่าคุณน่าจะใช้ของผมได้
- วิธีทำไม่ได้เอามาหมด แต่คิดว่าครอบคลุม, มีนอกเหนือจาก HW  
- มีแปะตัวอย่าง HW และ Practice Final ไว้ให้ แต่ข้อที่แทนสูตรปุ๊บออกปัั๊บ ผมตัดทิ้งไปนะ
- ลายมือใน HW เป็นของเพื่อนในกลุ่ม
**ถ้าจารย์ออกนอกเนื้อหานอกจากนี้ก็โชคดีละกัน ตัวใครตัวมัน**', 'CSS322', '1', '2025', 'Year 3', 'Final', '299.00', 'cheatsheets/mock-018.pdf', null, 1, null, '16.27', 4, 'http://localhost:3000/previews/preview-068.jpg', null, null, null, true, false, null, 'approved', 1, '2025-11-22 10:28:46', null, 117, 2, 7, 1, null, '2025-11-22 06:06:39', '2026-10-11 04:37:59.541795', false, null, false, null, null, ARRAY['Final']), (35, 'Data Communication: Everything My Brain Refused to Remember', '### กรุณาเช็คกับอาจารย์ว่าสามารถเอาของคนอื่นเข้าห้องสอบได้รึเปล่า + ต้องเขียนมือรึเปล่า

Use as your own risk!

- รวมเนื้อหาทั้งหมด 8 บท: Data Link Control, Multiplexing Techniques, WAN Technologies and Protocols, Asynchronous Transfer Mode (ATM), IP Addressing and Subnets, Routing Algorithm, Network Topology, Email Systems
- ส่วนใหญ่เนื้อหาเป็น**ภาษาไทย** อ่านเข้าใจง่าย ๆ (ผู้ซื้อควรสามารถ Translate เป็นภาษาอังกฤษได้เองโดยอัตโนมัติ เวลาตอบในข้อสอบ)
- แถมคลิปการสอนเรื่อง Routing Algorithm ไปหนึ่งคลิป (บทอื่นไม่ได้สอน5555)
- เนื้อหาพิเศษที่ไม่มีใน Cheat Sheet คือเรื่อง Yamaha Piano (Special Guest Lecture)', 'CSS331', '1', '2025', 'Year 3', 'Final', '99.00', 'cheatsheets/mock-019.pdf', null, 1, null, '34.20', 4, 'http://localhost:3000/previews/preview-084.jpg', null, '["https://youtu.be/MOCK0000051","https://youtu.be/MOCK0000052"]', null, true, false, null, 'approved', 1, '2025-11-23 04:23:09', null, 125, 6, 1, 1, null, '2025-11-23 04:22:59', '2026-10-08 09:45:01.210277', false, null, false, null, null, ARRAY['Final']), (36, 'Technical Writing (Information Part)', '- รวมเนื้อหา (คร่าว ๆ) ของ GTS302 ที่สามารถออก Part Infomation ที่เป็น Multiple Choice ให้
- **มีคลิปวีดีโอ ทวนเนื้อหา Information + Grammar (50 นาที)**
- แถมคลิป เนื้อหาในห้องเรื่องทุกเรื่อง Ingredients, Progress Reports, Recommendation Reports, Proposals (ใน Part Final) ยกเว้น Scientific Reports', 'GTS302', '1', '2025', 'Year 3', 'Final', '59.00', 'cheatsheets/mock-020.pdf', null, 1, null, '5.66', 1, 'http://localhost:3000/previews/preview-124.jpg', null, '["https://youtu.be/MOCK0000053","https://youtu.be/MOCK0000054","https://youtu.be/MOCK0000055","https://youtu.be/MOCK0000056","https://youtu.be/MOCK0000057"]', null, true, false, null, 'approved', 1, '2025-11-25 22:42:16', null, 72, 5, 1, 1, null, '2025-11-25 22:42:03', '2026-10-03 14:51:50.935459', false, null, false, null, null, ARRAY['Final']), (37, 'Database Systems SQL Cheat Sheet', '- SQL ตั้งแต่ DDL, DML, DQL, JOIN, FUNCTION, VIEW, TRIGGER ยัน TRANSACTION พร้อมตัวอย่างใช้งานจริง
- ทุกอย่างบนโลก (แต่อาจจะไม่ครบ 555) แต่ครบพอให้รอดแน่นอน ในการสอบ
- ข้อสอบเป็น Open-Book ปริ้นเข้าได้ไม่จำกัด
>ข้อสอบจริงอันนี้แอบมีประโยชน์จริง ๆ', 'CSS325', '1', '2025', 'Year 3', 'Final', '0.00', 'cheatsheets/mock-021.pdf', null, 1, null, '0.27', 10, 'http://localhost:3000/previews/preview-081.jpg', null, null, null, true, false, null, 'approved', 1, '2025-11-28 10:06:25', null, 228, 40, 1, 1, null, '2025-11-28 10:06:13', '2026-10-12 11:16:44.388309', false, null, false, null, null, ARRAY['Final']), (38, 'CSS326 Database Programming Laboratory', '**5 คนแรก แถมปริ้นให้ฟรี!! รับหน้าห้องสอบ**

เนื้อหาประกอบด้วย
- Syntax SQL Queries (CRUD) ที่ควรรู้ประมาณ 20 หัวข้อ 
- Procedures vs Functions , Triggers
- PHP
- Lab Assignment 12

*ถ้าปริ้นแล้วอ่านไม่ออก หรือ ไม่ชัด ติดต่อ : +66 6-3697-5829* *ใบตอง*', 'CSS326', '1', '2025', 'Year 3', 'Final', '50.00', 'cheatsheets/mock-022.pdf', null, 1, null, '24.97', 2, 'http://localhost:3000/previews/preview-083.jpg', null, null, null, true, false, null, 'approved', 1, '2025-12-01 05:30:40', null, 153, 24, 2, 1, null, '2025-12-01 05:30:17', '2026-10-12 11:16:18.355802', false, null, false, null, null, ARRAY['Final']), (39, 'Midterm Network Lab', 'Contains Lab1-Lab5
- quiz มีไม่กี่ข้อ

ไม่มีรับประกันใดๆ 
เช็คให้ดี อันไหนปริ้นมาแล้วเบลอๆ เขียนเพิ่มเติมเอาเองนะ
**use at your own RISK**

Last Update file : 18/02/2026', 'DES352', '2', '2025', 'Year 3', 'Midterm', '69.00', 'cheatsheets/mock-023.pdf', null, 1, null, '23.59', 2, 'http://localhost:3000/previews/preview-116.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-17 08:57:23', null, 43, 3, 2, 1, null, '2026-02-17 08:49:56', '2026-10-03 14:51:51.536776', false, null, false, null, null, ARRAY['Midterm']), (40, 'Digital Circuit Midterm', '**Sec. : Aj. Phisan,**

- เท่าที่จำได้ ข้อสอบเหมือนใน Activity ในห้องเรียน แค่เปลี่ยนอะไรนิดหน่อย

- ที่ยากสุดคือ แก้สมการ Logic Equation ฝึกทำโจทย์ให้หลากหลาย ให้คุ้นเคยกับการใช้ Theroem ต่างๆ 

- ข้อสุดท้าย สร้าง Circuit ก็ยากเลย ดูตัวอย่างเยอะๆ เขียนอะไรไปหน่อย ครูให้คะแนนอยู่บ้าง

**ข้อสอบมีไม่กี่ข้อ แต่ละข้อจะคะแนนเยอะมาก หมายความว่า ไม่ควรพลาดเยอะ**

ป.ล.ให้หน้าทดแนวข้อสอบไปด้วย, ไปลบเอาตอนปริ้นนะ', 'EES271', '1', '2024', 'Year 2', 'Midterm', '50.00', 'cheatsheets/mock-024.pdf', null, 1, null, '11.84', 3, 'http://localhost:3000/previews/preview-119.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-20 00:02:59', null, 45, 6, 2, 1, null, '2026-02-19 23:58:52', '2026-10-10 11:56:53.85449', false, null, false, null, null, ARRAY['Midterm']), (41, 'Computer Network and Internetworking WOWZA', '> **The final draft has been released**

> Some sections of this cheat sheet are currently written in **Thai**. Please read carefully, especially if you are not familiar with Thai.

Future updates may include partial or full translations into English.
# CSS334: Computer Network and Internetworking  
**Instructor:** Dr. Apichon Witayangkurn  

## Course Content (6 Lectures)

- **Lecture 1** – Introduction  
- **Lecture 2** – Internet and Access Technology  
- **Lecture 3** – Application Layer (Part 1)  
- **Lecture 4** – Application Layer (Part 2)  
- **Lecture 5** – Transport Layer (Part 1)  
- **Lecture 6** – Transport Layer (Part 2)  

---

## Version Log

- **Feb 20 (8:00 PM)** – First Draft
- **Feb 21 (1:54 PM)** – Added more images to Lectures 1–2, corrected duplicate text, improved wording, and cleaned up LaTeX formatting (some `$ $` still remain and will be fixed in future updates)
- **Feb 22 (3:31 PM)** – Final Draft: will add more content, additional images, key formulas, state diagrams, and further refinements for clarity and completeness
- **Feb 22 (7:26 PM)** – Another version, add thickness to the state diagram code part, so it can be seen clearly when printed on paper. Add more images.
- **Feb 22, 7:52 PM** – I assure you this is the final one. I''ve removed all the LaTeX `$ $` slop and enlarged the image size for better clarity. Good luck!

This document will be continuously updated and refined. Please stay tuned for revisions.', 'CSS334', '2', '2025', 'Year 3', 'Midterm', '250.13', 'cheatsheets/mock-025.pdf', null, 1, null, '76.40', 2, 'http://localhost:3000/previews/preview-094.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-20 06:04:34', null, 169, 12, 1, 1, null, '2026-02-20 06:04:21', '2026-10-10 06:30:16.007884', false, null, false, null, null, ARRAY['Midterm']), (42, 'CSS225 OS Cheat Sheet Midterm', 'CSS225 OS Cheat Sheet Midterm Aj.Seksan
ข้อ choice ตรง 90% มีตัวอย่างข้อเขียนครบ', 'CSS225', '2', '2024', 'Year 2', 'Midterm', '40.00', 'cheatsheets/mock-026.pdf', null, 1, null, '7.86', 2, 'http://localhost:3000/previews/preview-065.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-20 17:14:41', null, 515, 57, 42, 1, null, '2026-02-20 10:20:13', '2026-10-03 14:51:52.055138', false, null, false, null, null, ARRAY['Midterm']), (43, 'CSS225 OS Cheat Sheet Final', 'CSS225 OS Cheat Sheet Final Aj.Seksan
ข้อ choice ตรง 90% มีตัวอย่างข้อเขียนครบ', 'CSS225', '2', null, 'Year 2', 'Final', '40.00', 'cheatsheets/mock-027.pdf', null, 1, null, '5.89', 2, 'http://localhost:3000/previews/preview-063.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-20 17:14:39', null, 379, 45, 42, 1, null, '2026-02-20 10:22:11', '2026-10-09 11:22:30.545524', false, null, false, null, null, ARRAY['Final']), (44, 'Algorithms Design Midterm', 'Section Aj. Suparchoek, 

**Topics :**
- Asymptotic notion
- Mathematical analysis of non-recursive algorithms
- Gale-shapley algorithm 
- Apriori algorithm & association rules problem
- Idea of greedy algorithms & examples
- knapsack problem
- Interval Scheduling Problem & Interval Partitioning

ป.ล.1 : เรียนกับอาจารย์คนอื่นไม่แนะนำให้ซื้อ เพราะเนื้อหาไม่ค่อยเหมือนกัน

ป.ล.2 : เคล็ดลับการสอบกับอจ.คนนี้คือ ทำให้ครบตามโจทย์สั่ง ถ้าโจทย์บอกให้เขียนอธิบายด้วย อย่าลืมเขียน ไม่ใช่วาดตารางอย่างเดียว', 'DES227', '2', '2024', 'Year 2', 'Midterm', '50.00', 'cheatsheets/mock-028.pdf', null, 1, null, '13.12', 2, 'http://localhost:3000/previews/preview-104.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-21 03:17:34', null, 94, 9, 2, 1, null, '2026-02-21 03:14:41', '2026-10-03 14:51:52.611293', false, null, false, null, null, ARRAY['Midterm']), (45, 'Computer Architectures Midterm', 'เรียนกับ Aj, Sumek,

อันนี้เป็นเขียนมือ เลยอัปโหลดไว้ให้ได้ดูกันเฉยๆ จำหัวข้อไม่ได้ละ', 'CSS224', '2', '2023', 'Year 1', 'Midterm', '0.00', 'cheatsheets/mock-029.pdf', null, 1, null, '3.77', 2, 'http://localhost:3000/previews/preview-061.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-21 04:10:51', null, 38, 4, 2, 1, null, '2026-02-21 03:50:04', '2026-10-07 06:07:00.281283', false, null, false, null, null, ARRAY['Midterm']), (46, 'Computer Architecture Final Cheatsheet', 'เรียนกับ Aj, Sumek,

เขียนมืออีกแล้ว -> เลยอัปโหลดไว้ให้ได้ดูกันเฉยๆ มาดูหัวข้อกันเอาเองในไฟล์

หน้า 2 เป็นรวมโจทย์ Question ในห้องเรียน

ป.ล.จำได้แค่ Pipelined สนุกมาก, อาจารย์น่ารัก', 'CSS224', '2', '2023', 'Year 1', 'Final', '0.00', 'cheatsheets/mock-030.pdf', null, 1, null, '4.62', 2, 'http://localhost:3000/previews/preview-060.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-21 04:10:46', null, 84, 14, 2, 1, null, '2026-02-21 03:54:22', '2026-10-07 03:48:31.59655', false, null, false, null, null, ARRAY['Final']), (47, 'Midterm Artificial Intelligence and Applications', 'Section Aj.Sumeth,

มีทั้งหมด 4 หน้า (A4 2 แผ่น)

จำได้ว่า Cheatsheet นี้ค่อนข้างตรง ตอนมิดเทอม 

ให้ AI สรุป Topic มาให้

	1.	Types of Machine Learning (Supervised / Unsupervised)
	2.	Accuracy, TP/TN/FP/FN
	3.	Confusion Matrix (Binary / Multi-class)
	4.	Precision, Recall, F1-score
	5.	Train / Validation / Test Split
	6.	Data Leakage
	7.	Feature & Types of Features
	8.	Normal Distribution / Gaussian
	9.	Feature Scaling (Normalization / Standardization)
	10.	K-Nearest Neighbor (KNN) & Euclidean Distance
	11.	Naive Bayes / Gaussian NB
	12.	Decision Tree (ID3, C4.5, Entropy, Information Gain)
	13.	Missing Value Handling
	14.	AI Types (ANI, AGI, ASI)
	15.	Graph & Tree
	16.	DFS (Depth First Search)
	17.	BFS (Breadth First Search)
	18.	Minimax Algorithm
	19.	Monte Carlo Tree Search
	20.	8-Puzzle
	21.	Dijkstra’s Algorithm
	22.	A* Algorithm
	23.	Manhattan Distance
	24.	Shortest Path Applications

โปรดใช้วิจารณญาณก่อนตัดสินใจ', 'GTS124', '2', '2023', 'Year 1', 'Midterm', '50.00', 'cheatsheets/mock-031.pdf', null, 1, null, '21.23', 4, 'http://localhost:3000/previews/preview-122.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-21 04:10:40', null, 69, 3, 2, 1, null, '2026-02-21 04:02:37', '2026-10-07 03:46:25.854431', false, null, false, null, null, ARRAY['Midterm']), (48, 'BAS357 Mastery Notes - Survival Kit', '# BAS357 Economic Decision Analysis

>A comprehensive cheat sheet for BAS357: Economic Decision Analysis, fully written in Thai.

Covers all major topics from Class 1–6:
- Economic Principles & Basic Financial Statements  
- Basic Financial Statements  
- Statement of Cash Flows  
- Capital Budgeting  
- Incremental Analysis  

Clearly structured, easy to understand, and ideal for exam preparation and quick revision throughout the semester.

If I have time, a walkthrough video explaining the cheat sheet and key concepts will also be provided 😅', 'BAS357', '2', '2025', 'Year 3', 'Midterm', '189.75', 'cheatsheets/mock-032.pdf', null, 1, null, '19.66', 2, 'http://localhost:3000/previews/preview-053.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-21 06:51:21', null, 65, 9, 1, 1, null, '2026-02-21 06:51:09', '2026-10-05 19:05:06.598111', true, '2026-07-13 17:41:58.302757', false, null, null, ARRAY['Midterm']), (49, 'Microcontroller Midterm (Google''s Version)', '# Cheat Sheet Midterm วิชา Microcontroller
ครอบคลุมเนื้อหา 6 บท
- 01 - Microcontroller Basics and ATmega328 Structure
- 02 - Basic AVR Assembly Language and Programming
- 03 - Loop, Stack, Call, and Time Delay
- 04 - AVR Input Output Port Programming
- 05 - AVR Arithmetic and Logic Instructions
- 06 - More AVR Assembly Language

> จำได้เนื้อหาค่อนข้างครบเลย แต่ตอนนั้นยังจัดเรียงไม่ค่อยเป็นระเบียบเท่าไหร่
หน้าหลังช่วยพาร์ท Code ไว้ได้เยอะมาก ที่บางข้อหน้าหลังก็จะยากไป เอามาจากส่วนของ [Mock Exam](https://example.com) อีกทีนึง

ต้องบอกว่าไฟล์ค่อนข้างใหญ่เลยนะ เป็น Image (High Quality) มาแปลงเป็น PDF อีกที ถ้าให้ดีปริ้นที่ ศกร. หรือ ห้องสมุด (อย่าพึ่งพวก Double A เพราะเปิดไฟล์ใหญ่ไม่ค่อยได้)', 'CSS332', '2', '2024', 'Year 2', 'Midterm', '67.00', 'cheatsheets/mock-033.pdf', null, 1, null, '104.13', 2, 'http://localhost:3000/previews/preview-090.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-21 09:19:14', null, 88, 12, 1, 1, null, '2026-02-21 09:17:45', '2026-10-03 14:51:53.553187', false, null, false, null, null, ARRAY['Midterm']), (50, 'OS O-Jai (Midterm)', 'ไฟล์ค่อนข้างใหญ่ เพราะเป็นไฟล์ภาพอัดเป็น PDF (ไม่แนะนำให้เปิดใน Mobile) แต่การันตีความชัด
**เนื้อหาครบ 100% แน่นอนอยู่แล้ว** ยัด Lecture เข้าไปทุกอย่าง — **ข้อสอบจริง แนะนำทำพาร์ทเขียนก่อนนะ**

ถ้าให้ดีปริ้นที่ ศกร. หรือ ห้องสมุด (อย่าพึ่งพวก Double A เพราะเปิดไฟล์ใหญ่ไม่ค่อยได้)', 'CSS225', '2', '2025', 'Year 2', 'Midterm', '70.00', 'cheatsheets/mock-034.pdf', null, 1, null, '124.61', 2, 'http://localhost:3000/previews/preview-082.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-21 09:31:17', null, 58, 4, 1, 1, null, '2026-02-21 09:31:06', '2026-10-03 14:51:53.71989', false, null, false, null, null, ARRAY['Midterm']), (51, 'CSS225 OS Lecture Midterm (FREE)', 'CSS225 OS Lecture Midterm Sec. Aj.Seksan
จดในคาบครบ แต่จดตัวเล็กนิดนึง;—;
Lecture 1-5', 'CSS225', '2', '2024', 'Year 2', 'Midterm', '0.00', 'cheatsheets/mock-035.pdf', null, 1, null, '27.35', 333, null, null, null, null, true, false, null, 'approved', 1, '2026-02-22 01:35:04', null, 101, 26, 42, 1, null, '2026-02-22 00:24:04', '2026-10-03 14:51:53.872916', false, null, false, null, null, ARRAY['Midterm']), (52, 'Economic Decision Analysis', 'Covers all topics from class 1-6 for quick review and formulas for exam guide.', 'BAS357', '2', '2025', 'Year 3', 'Midterm', '69.00', 'cheatsheets/mock-036.pdf', null, 1, null, '24.02', 2, 'http://localhost:3000/previews/preview-055.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-22 21:14:05', null, 31, 0, 17, 1, null, '2026-02-22 18:44:13', '2026-10-03 14:51:54.074891', false, null, false, null, null, ARRAY['Midterm']), (53, 'Economic Decision Analysis Midterm', '**Every detail, every exercise**', 'BAS357', '2', null, null, 'Midterm', '99.00', 'cheatsheets/mock-037.pdf', null, 1, null, '2.19', 2, 'http://localhost:3000/previews/preview-054.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-22 23:07:22', null, 22, 0, 12, 1, null, '2026-02-22 23:06:46', '2026-10-03 14:51:54.277015', false, null, false, null, null, ARRAY['Midterm']), (54, 'CSS454 Computer and Communication Security Summary Midterm', 'สรุปเนื้อหา CSS454 Computer and Communication Security Ch. 1-7 เน้นconcept', 'CSS454', '2', null, 'Year 3', 'Midterm', '40.00', 'cheatsheets/mock-038.pdf', null, 1, null, '6.85', 12, 'http://localhost:3000/previews/preview-098.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-23 07:05:59', null, 49, 1, 42, 1, null, '2026-02-23 06:30:06', '2026-10-03 14:51:54.531157', false, null, false, null, null, ARRAY['Midterm']), (57, 'Computer Graphics, All on One A4', '>หากโหลดไปแล้ว เนื้อหาไม่ตรง สามารถขอ Refund ได้น้าา ทักมา ig: peanut.sheets

ถ้าจำไม่ผิด ปีที่แล้ว ตอน Midterm คือให้เอาเข้าแค่ 1  A4 Cheat Sheet + Print Super Cheat Sheet ของอาจารย์เพิ่มได้ (ไม่แน่ใจว่าปีนี้มีรึเปล่า)

- **ข้อสอบ Midterm ของปีที่แล้ว** ที่จำ ๆ ออกมาอยู่ใน [GitHub Repo](https://example.com/lab-repo) แล้ว (สามารถลองเอาไปฝึก ๆ ดูได้ เผื่อจะออกคล้าย ๆ)
- หน้าแรก สรุป Function คร่าว ๆ
- หน้าหลังรวมทุก Lab ที่ได้ทำมา รวม Bonus ของแต่ละ Lab ด้วย (ตัวเล็กนิดนึง แนะนำว่าลองปริ้นว่ามองเห็นรึเปล่า)', 'CSS221', '2', '2024', 'Year 2', 'Midterm', '29.00', 'cheatsheets/mock-039.pdf', null, 1, null, '45.58', 2, 'http://localhost:3000/previews/preview-059.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-24 02:08:49', null, 70, 6, 1, 1, null, '2026-02-24 02:08:33', '2026-10-03 14:51:55.053642', false, null, false, null, null, ARRAY['Midterm']), (58, 'CSS323 Software Engineering Cheat Sheet Midterm', 'CSS323 Software Engineering Cheat Sheet Midterm Sec. Aj.Sasiporn
by Proud & Tete', 'CSS323', '2', null, 'Year 3', 'Midterm', '40.00', 'cheatsheets/mock-040.pdf', null, 1, null, '1.22', 2, 'http://localhost:3000/previews/preview-078.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-25 08:24:41', null, 104, 3, 42, 1, null, '2026-02-25 07:56:32', '2026-10-03 14:51:55.282353', false, null, false, null, null, ARRAY['Midterm']), (59, 'Software Engineering Cheat Sheet', 'Contains lecture 1-3, lecture 4 มีแค่ UML use case diagram เพราะพื้นที่ไม่เพียงพอ', 'CSS323', '2', '2025', 'Year 3', 'Midterm', '55.00', 'cheatsheets/mock-041.pdf', null, 1, null, '24.14', 2, 'http://localhost:3000/previews/preview-076.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-25 08:24:39', null, 47, 0, 17, 1, null, '2026-02-25 08:19:47', '2026-10-03 14:51:55.446465', false, null, false, null, null, ARRAY['Midterm']), (60, 'DES332 Computer and Network Security', '# DES332 - Computer and Network Security!!
- Taught by Aj. Hung
- **6 Pages** - มีทั้งสรุปเนื้อหา คีย์สำคัญ โจทย์ และแบบฝึกหัด
- Covers **module 1 - 4**
- Based on practice from **SIIT31 & SIIT32**', 'DES332', '2', '2025', 'Year 3', 'Midterm', '69.00', 'cheatsheets/mock-042.pdf', null, 1, null, '14.16', 6, 'http://localhost:3000/previews/preview-111.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-25 09:02:45', null, 118, 1, 136, 1, null, '2026-02-25 08:52:47', '2026-10-03 14:56:58.378255', false, null, false, null, null, ARRAY['Midterm']), (61, 'SWE Midterm Cheat Sheet (Google''s Version)', '>อัปเดต 2:24 AM เวอร์ชั่น Final แล้ว ลองอ่าน ๆ ดูมองเห็นรึเปล่า สู้ ๆ

>อัปเดต 1:22 AM ตอนนี้เดี๋ยวอาจจะมีเวอร์ชันใหม่ขยายให้ตัวหนังสือชัดแจ๋วมากขึ้น เพราะว่าตอนนี้ตัวเล็กมากลองมาปริ้นแล้ว5555

>ทำตอนดึกมาก หวังว่าจะโชคดีในการสอบทุกคนน

- หน้าแรก 4 Columns, หน้าหลัง 3 Columns
- หน้าแรกจะเป็นพาร์ทที่น่าจะออก Multple Choice ได้ พวกบทที่ 1-2 (Introduction to Software Engineering, Software Process Models and Agile Methods)
- ส่วนบทที่ 3 ส่วนใหญ่จะอยู่หน้าหลัง ขยายขนาดให้เห็นชัด (หวังว่านะ555)
- ใส่ BPMN ทั้งโลกที่จะหาได้มาให้ด้วย เผื่อเป็น Reference', 'CSS323', '2', '2025', 'Year 3', 'Midterm', '99.00', 'cheatsheets/mock-043.pdf', null, 1, null, '33.58', 2, 'http://localhost:3000/previews/preview-075.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-25 11:02:49', null, 59, 15, 1, 1, null, '2026-02-25 11:02:23', '2026-09-27 05:11:29.154413', false, null, false, null, null, ARRAY['Midterm']), (62, 'CSS323: Software Engineering Midterm Cheat sheet', '# ขายเล่นๆ 
by August(Singha), Toon(Pachara), และแรงงานทาส Mo(Pawit)
หน้าสองมีเนื้อหา Choice
- กรอบสีแดง - BPNM
- กรอบสีเขียว - Sequence Diagram
- กรอบสีส้ม - Use Case Diagram + Description
- กรอบสีฟ้า - Class Diagram
- กรอบสีชมพู - Choice

ซื้อไปถ้าไม่ได้ใช้ยินดีคืนเงิน ig: pawit11', 'CSS323', '2', '2026', 'Year 3', 'Midterm', '50.69', 'cheatsheets/mock-044.pdf', null, 1, null, '8.90', 2, 'http://localhost:3000/previews/preview-077.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-25 12:11:55', null, 52, 0, 44, 1, null, '2026-02-25 12:11:16', '2026-09-26 11:09:09.480387', false, null, false, null, null, ARRAY['Midterm']), (63, 'DES227 Algorithm Design Cheat Sheet Midterm', 'DES227 Algorithm Design Cheat Sheet Midterm Sec. Dr.Gun ปีที่แล้วมีเกือบครบทุกข้อ
Gale-Shapley, Greedy Algorithm, Kruskal Algorithm, Divide and conquer , Finding closest point, Weighted interval scheduling, Interval scheduling for the set of requests, Interval partitioning problem, Cell phone coverage problem, Subset-sum, EDF, Clustering problem มีแปะตัวอย่างด้วย', 'DES227', '2', null, 'Year 2', 'Midterm', '40.00', 'cheatsheets/mock-045.pdf', null, 1, null, '5.39', 2, 'http://localhost:3000/previews/preview-105.jpg', null, null, null, true, false, null, 'approved', 1, '2026-02-26 00:49:14', null, 150, 17, 42, 1, null, '2026-02-26 00:48:29', '2026-09-27 05:11:28.614981', false, null, false, null, null, ARRAY['Midterm']), (64, 'CSS221 Computer Graphics Summary Final', 'CSS221 Computer Graphics Summary Final Sec. Dr.Samart ปีที่แล้ว เนื้อหาเกือบทั้งหมดหลัง midterm ตั้งแต่ interpolation, geometric transformation, matrix algebra แถม review lab exam ไปให้ด้วย

ปล. เนื้อหาเรียงจาก ซ้าย->ขวา, บน->ล่าง โดยแบ่งด้านบนกับด้านล่างด้วยเส้นสีส้ม', 'CSS221', '2', '2024', 'Year 2', 'Final', '89.00', 'cheatsheets/mock-046.pdf', null, 1, null, '31.57', 20, 'http://localhost:3000/previews/preview-057.jpg', null, null, null, true, false, null, 'approved', 1, '2026-03-01 19:42:59', null, 64, 5, 17, 1, null, '2026-03-01 19:39:26', '2026-09-26 11:09:09.480387', false, null, false, null, null, ARRAY['Final']), (65, 'Network Lab Finallllzlzlzz', '# Network Lab Cheat Sheet for Final Exam (Section Aj. Sasirassamee)
- Lab 6 - Internetworking I
- Lab 7 - Internetworking II
- Lab 8 - Transport-Layer Protocols
- Lab 9 - Application-Layer Protocols
- Lab 10 - Basic Linux Firewall
___


- ตอนนี้เนื้อหาครบแล้ว ทุก Lab ที่เรียนมา (แต่ว่าจะยังใช้พื้นที่ 1.5 หน้าอยู่) จะอัปเดตเรื่อย ๆ
- ใส่เนื้อหา Assignment ใน Lab ที่สำคัญ ๆ ให้ + Command ที่ต้อง run
- **April 20, 2026** จะอัปคลิป (YouTube) พูดถึงเนื้อหาทั้งหมดที่ต้องรู้ ทำเป็นแน่นอน!! รออัปเดตคลิปภายในวันนั้นได้

>**คำแนะนำ:** ให้ลองทำ Assignment ใหม่, รู้ว่าใช้ Command อะไรบ้างในการ Add static routes, Inspect Packet Payload ใน Wireshark อย่างไร


## Version Log
- **April 9 (2:31 PM)** – First Draft (฿199)
- **April 10 (1:15 AM)** – Added the missing description text for the connection termination
- **April 20 (5:53 PM)** – หลังจากพักผ่อนช่วงสงกรานต์ กลับมาประจำตำแหน่งหน้าที่ต่อแล้ว คืนนี้เติมเต็มหน้าที่ 2 ด้วยสารพัดสิ่ง + Video expected tonight!! xoxo
- **April 20 (9:35 PM)** – Add Supplementary เพิ่มเติม Command ที่ต้องใช้ การแปลง Logical -> Physical Network Diagram ไม่เหลืออะไรที่จะใส่แล้วอะ + มี Free Space ให้ข้างหลังเผื่อต้องการใส่อะไรเองเพิ่มเติม
- **April 20 (10:12 PM)** – คิดว่านี่ Final Version ละ (ไม่อยากทำคลิปแล้ว จริง ๆ อัดไปแล้ว 30 นาที แต่เหนื่อย พูดไม่รู้เรื่อง ใครต้องการจริง ๆ ทักมา5555 รัก)', 'DES352', '2', '2025', 'Year 3', 'Final', '199.00', 'cheatsheets/mock-047.pdf', null, 1, null, '16.58', 2, 'http://localhost:3000/previews/preview-112.jpg', null, '["https://youtu.be/MOCK0000058"]', null, true, false, null, 'approved', 1, '2026-04-09 00:28:12', null, 115, 11, 1, 1, null, '2026-04-09 00:27:57', '2026-09-26 11:09:09.480387', false, null, false, null, null, ARRAY['Final']), (66, 'DES352 Network Lab Cheat Sheet Final', 'DES352 Network Lab Cheat Sheet Final Sec. Aj. Sasirassamee (เนื้อหา + command for linux & imunes) ครบจาก Lab manual + slide', 'DES352', '2', null, 'Year 3', 'Final', '40.00', 'cheatsheets/mock-048.pdf', null, 1, null, '19.06', 2, 'http://localhost:3000/previews/preview-115.jpg', null, null, null, true, false, null, 'approved', 1, '2026-04-19 02:57:41', null, 140, 6, 42, 1, null, '2026-04-19 00:21:22', '2026-09-26 11:09:09.480387', false, null, false, null, null, ARRAY['Final']), (67, 'Operating Systems - Final Cheatsheet', '**CSS225 - Aj. Seksan Laitrakun**
- 2 Pages
- ครอบคลุมทุกบทที่ออกสอบ
- เก็งโดย **SIIT32 ที่เคยได้ A** ตรงทั้ง Multiple Choice ทั้งข้อเขียน!!
- พร้อม Color Coding ให้อ่านง่าย สแกนไว!!', 'CSS225', '2', '2025', 'Year 2', 'Final', '39.00', 'cheatsheets/mock-049.pdf', '1ee36b995e3301d4d755ff4cfe8496ce6cf45e2e3cad6f89e3f3046e356c373f', 7, '[{"hash":"07b008858de0021e78e88fd2ecfc3733572814f12f004f982963cd21f7f3f9cb","version":2,"updated_at":"2026-05-10T01:44:27.438Z"},{"hash":"8f263906d5667f239db0223fb199f5fa54160f76eb1d7682af5387ae6ed30246","version":3,"updated_at":"2026-05-10T03:11:25.843Z"},{"hash":"d35cacbab26a10c9f1a4e01b2be18fabf035666097462b479f6eb673c7706029","version":4,"updated_at":"2026-05-10T05:46:09.137Z"},{"hash":"5d8f59f329ca7f549b9f5f91e9266485bce5bb9116aebea236920ecbc3f15ac1","version":5,"updated_at":"2026-05-10T07:44:56.724Z"},{"hash":"10b566d6116aa44614708284c7f0624d80565094013d2c0666dd8629c39b5ff9","version":6,"updated_at":"2026-05-10T14:54:19.533Z"},{"hash":"1ee36b995e3301d4d755ff4cfe8496ce6cf45e2e3cad6f89e3f3046e356c373f","version":7,"updated_at":"2026-06-04T08:39:01.228Z"}]', '11.26', 2, 'http://localhost:3000/previews/preview-064.jpg', null, null, null, true, false, null, 'approved', 1, '2026-04-19 16:53:52', null, 759, 99, 136, 1, null, '2026-04-19 10:27:40', '2026-10-09 10:51:44.107545', false, null, false, null, null, ARRAY['Final']), (68, 'DES352 Network Lab - Cheat Sheet Final (v2)', '- DES352 Network Lab - Final Cheat Sheet
- Section: อาจารย์ Apichon


⚡ด้านหลังแน่นกว่านี้นะ😊

# Content
- Lab 6: Internetworking I
- Lab 7: Internetworking II
- Lab 8: Transport Layer Protocols
- Lab 9: Application Layer Protocols
- Lab 10: Basic Linux Firewall

# Description
- รวมควิซจาก Section อาจารย์ Apichon
- อธิบายเนื้อหาให้อ่านเข้าใจง่าย เน้นความชัดเจน
- เรียบเรียงขั้นตอนการทำ Lab แบบเป็นลำดับ (step-by-step)
- ครอบคลุมเนื้อหาทั้งจาก Lab และ Lab Brief', 'DES352', '2', '2025', 'Year 3', 'Final', '60.00', 'cheatsheets/mock-050.pdf', null, 1, null, '8.67', 2, 'http://localhost:3000/previews/preview-113.jpg', null, null, null, true, false, null, 'approved', 1, '2026-04-20 02:01:04', null, 76, 6, 10, 1, null, '2026-04-20 01:23:35', '2026-09-26 11:09:09.480387', false, null, false, null, null, ARRAY['Final']), (69, 'CSS225 OS Lecture Final (FREE)', 'CSS225 OS Lecture Midterm Sec. Aj.Seksan
 จดในคาบครบ
 Lecture 6-9', 'CSS225', '2', null, 'Year 2', null, '0.00', 'cheatsheets/mock-051.pdf', null, 1, null, '25.23', 370, null, null, null, null, true, false, null, 'approved', 1, '2026-04-20 02:14:45', null, 262, 63, 42, 1, null, '2026-04-20 02:13:42', '2026-10-10 16:29:21.503814', false, null, false, null, null, ARRAY[]::text[]), (70, 'This Cheat Sheet Is All You Need', 'Networking Laboratory Final', 'DES352', '2', '2025', 'Year 3', 'Final', '44.44', 'cheatsheets/mock-052.pdf', null, 1, null, '7.96', 2, 'http://localhost:3000/previews/preview-114.jpg', null, null, null, true, false, null, 'approved', 1, '2026-04-21 16:58:06', null, 42, 0, 12, 1, null, '2026-04-21 12:54:37', '2026-09-26 11:09:09.480387', false, null, false, null, null, ARRAY['Final']), (71, 'TU108 - Comprehensive Summary', '**Summary for TU108**

- Contains chapters: 1, 2, 3, 5, 6, 7, 11, 12
- Contains **Thai and English**
- Contains **25 Pages** with examples, definitions, and sample quizzes', 'TU108', '2', null, 'Year 1', 'Final', '59.00', 'cheatsheets/mock-053.pdf', '8656c1a8c97eba9d6e265c393ed65ee39cf942994d8e67af1480def844074f43', 2, '[{"hash":"8656c1a8c97eba9d6e265c393ed65ee39cf942994d8e67af1480def844074f43","version":2,"updated_at":"2026-08-23T05:24:40.557Z"}]', '10.97', 25, 'http://localhost:3000/previews/preview-131.jpg', null, null, null, true, false, null, 'approved', 1, '2026-04-25 00:56:12', null, 490, 41, 136, 1, null, '2026-04-25 00:31:40', '2026-10-05 11:51:57.38689', false, null, false, null, null, ARRAY['Final']), (72, 'DES102 Lecture Final (FREE)', 'DES102 Lecture Final Sec. Aj.Pakinee จดในคาบครบ', 'DES102', '2', null, 'Year 1', 'Final', '0.00', 'cheatsheets/mock-054.pdf', null, 1, null, '3.53', 102, null, null, null, null, true, false, null, 'approved', 1, '2026-04-28 05:54:23', null, 95, 16, 42, 1, null, '2026-04-28 05:51:56', '2026-10-07 03:48:48.108499', false, null, false, null, null, ARRAY['Final']), (73, 'DES227 Algorithms Design - Cheat Sheet Final', '- DES227 Algorithms Design - Cheat Sheet Final
- Section: Aj.Suparchoek

# Content
### 1. Divide & Conquer
### 2. Dynamic Programming
- Coin changing
- 0/1 Knapsack Problem
- Matrix Chain Multiplication
- Warshall''s and Floyd''s Algorithms
- Reliability Design
### 3. Coping with the Limitations of Algorithm Power
- Backtracking (n-Queens , Hamiltonian, Subset-sum, Graph coloring problem)
- Branch-and-Bound (Assignment, Knapsack problem)
### 4. String Matching Algorithm - Horspool''s Algorithm
### 5. P, NP, and NP-complete Problems



# Description
- เพียงพอสำหรับ Section: Aj.Suparchoek (ถ้าอ้างอิงจากปีที่แล้ว)
- เน้นวิธีการทำ (Algorithm)
- มีเนื้อหา/ทฤษฏีแค่เรื่อง Reliability Design กับ P, NP, and NP-complete Problems', 'DES227', '2', null, 'Year 2', 'Final', '35.00', 'cheatsheets/mock-055.pdf', null, 1, null, '11.53', 2, 'http://localhost:3000/previews/preview-102.jpg', null, null, null, true, false, null, 'approved', 1, '2026-04-29 03:49:23', null, 113, 18, 10, 1, null, '2026-04-29 03:47:16', '2026-09-27 05:11:28.081017', false, null, false, null, null, ARRAY['Final']), (74, 'CSS221 Computer Graphics - Cheat Sheet Final', '# Content
- Lecture 5-13
- Final exam paper 2024
- Examples on rotations (including Windmill)
- Practice 1-3 (Lab)
- Lab Bonus ทุกข้อ

# Description
- มีทั้งหมด 16 หน้า
- แต่ละหน้าไม่ได้แน่นมาก
- เน้นอันสำคัญๆ', 'CSS221', '2', null, 'Year 2', 'Final', '70.00', 'cheatsheets/mock-056.pdf', null, 1, null, '3.03', 16, 'http://localhost:3000/previews/preview-056.jpg', null, null, null, true, false, null, 'approved', 1, '2026-04-29 04:03:40', null, 135, 15, 10, 1, null, '2026-04-29 04:03:12', '2026-09-27 05:11:29.927546', false, null, false, null, null, ARRAY['Final']), (75, 'BAS357 Final Exam: Think Different', '**วิชานี้ Final เอา Cheat Sheet เข้าห้องสอบไม่ได้**

— รู้แล้ว ๆ เอา Cheat Sheet เข้าห้องสอบไม่ได้น่ะ แต่ทำมาเพื่อเป็นการทบทวน
- เขียนเป็นภาษาไทย อ่านง่ายเข้าใจ
- พร้อมกับ Analogy บริษัท Apple ที่คนทำอินเท่านั้น
- In-class Exercise ทั้งสองครั้ง เขียนเฉลยไว้ให้หมดแล้ว
- **พิเศษ! Early Mock Exam code** ที่จะสามารถเข้าถึง Mock Exam ของวิชานี้ได้ก่อนใคร (แปะไว้ให้แล้วหน้าในหน้าแรก หลังจากโหลดเสร็จ)
- [x] ~~ถ้าว่างจะอัปคลิปสอนลง (เดี๋ยวมาบอกวันและเวลาอีกที)~~ **ลงคลิปเรียบร้อยแล้ว** 🎉🎉🎉 สามารถเปิดดูได้เลย กรุณาดูแบบ x2 หน่อย พูดไม่รู้เรื่องเลยว่ะ เหมือนได้ทวนตัวเองนะ55555 อิอิ รักALL', 'BAS357', '2', '2025', 'Year 3', 'Final', '89.00', 'cheatsheets/mock-057.pdf', null, 1, null, '25.76', 2, 'http://localhost:3000/previews/preview-051.jpg', null, '["https://youtu.be/MOCK0000059"]', null, true, false, null, 'approved', 1, '2026-04-29 09:33:30', null, 120, 8, 1, 1, null, '2026-04-29 09:33:22', '2026-10-06 05:08:00.970898', false, null, false, null, null, ARRAY['Final']), (76, 'DES227 Algorithm Design Cheat Sheet Final', 'DES227 Algorithm Design Cheat Sheet Final Sec. Dr.Gun มีเนื้อหา+แปะตัวอย่าง 4 pages (2  sheets A4)', 'DES227', '2', null, 'Year 2', 'Final', '40.00', 'cheatsheets/mock-058.pdf', null, 1, null, '17.28', 4, 'http://localhost:3000/previews/preview-103.jpg', null, null, null, true, false, null, 'approved', 1, '2026-04-29 10:18:21', null, 127, 22, 42, 1, null, '2026-04-29 10:15:28', '2026-09-27 05:11:27.382967', false, null, false, null, null, ARRAY['Final']), (77, 'CSS225 Operating System - Cheat Sheet Final', '# Content
- Lecture 6-9
- Homework 6-9

# Description
- วิธีทำเขียนอย่างชัดเจน อ่านเข้าใจง่าย


⭐การันตีความใกล้เคียงข้อสอบโดย SIIT32


⭐ข้อสอบข้อกา ออกคล้าย Homework ที่ใส่ (ตัวสีแดง)', 'CSS225', '2', null, 'Year 2', 'Final', '60.00', 'cheatsheets/mock-059.pdf', null, 1, null, '1.65', 2, 'http://localhost:3000/previews/preview-062.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-01 05:58:22', null, 249, 44, 10, 1, null, '2026-05-01 05:29:14', '2026-10-10 07:42:04.640562', false, null, false, null, null, ARRAY['Final']), (78, '(Updated) CSS323 Software Engineering Cheat Sheet Final', 'CSS323 Software Engineering Cheat Sheet Final Sec. Aj.Sasiporn (4 pages, 2 sheets A4)', 'CSS323', '2', null, 'Year 3', 'Final', '40.00', 'cheatsheets/mock-060.pdf', null, 1, null, '2.52', 4, 'http://localhost:3000/previews/preview-074.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-02 04:28:28', null, 105, 4, 42, 1, null, '2026-05-02 04:27:41', '2026-09-26 11:09:09.480387', false, null, false, null, null, ARRAY['Final']), (79, 'Everything Network (Yes, You''ll Need a Magnifier)', '> **Update (หลังสอบเสร็จ Final 2026) ✅** เพิ่มเติมคำที่ออกสอบ (เติมคำ) + พาร์ทข้อเขียนว่ามีอะไรบ้าง

> I **RECOMMEND** printing this at ศกร (Krom Luang Naradhiwas Rajanagarinda Learning Centre) or at the TU Library for the best quality. I had it printed at the shop opposite SIIT, and the quality was very poor. Printing it at Double A Fast Print wouldn’t work either, due to the large file size.

> ~~เดี๋ยวจะมี~~อัปเดตในส่วนของ Homework Section ที่จะทำให้ตัวหนังสือมันหนาขึ้น / ใหญ่ขึ้น เพราะว่าเป็นส่วนที่สำคัญที่สุด **(Update: ลงแล้ววว 🎉🎉 ไม่น่าแก้ไขอะไรแล้ว ฝึกทำการบ้านกันเยอะ ๆ)**

## Before You Buy — Please Read

This is an **ultra-compact cheat sheet** covering:

- Lecture 7 – Network Layer (Part 1)
- Lecture 8 – Network Layer (Part 2)
- Lecture 9 – Network Layer (Part 3)
- Lecture 10 – Network Layer (Part 4)
- Lecture 11 – Link Layer (Part 1)
- Lecture 12 – Link Layer (Part 2)
- Lecture 13 – Wireless Network & Firewall

---

- This sheet is formatted into **5 columns**, meaning:
  - The text is **extremely small**
  - You may need a **magnifier** to comfortably read it
  - Highly recommended: **print a test copy first**

---

## What’s Inside

- Condensed key concepts from all lectures
- **3 homework sets (trimmed to only exam-relevant parts)**
- Focus on patterns and problem types likely to appear in exams

---

- You **cannot rely on this alone** to pass
- The homework section is **critical**
- You should:
  - Try solving problems yourself first
  - Use this sheet as a **review + recall tool**', 'CSS334', '2', '2025', 'Year 3', 'Final', '189.99', 'cheatsheets/mock-061.pdf', '9f40a8062433342cebb5b8c6472baefc98bc43de3ff3d50b6916c3f0fc917232', 4, '[{"hash":"6c46542d84d3e435eb1f2b49785020401d660d1bf99950d10ed8535247eba34a","version":2,"updated_at":"2026-05-07T07:27:46.857Z"},{"hash":"e35be7470e138b89b38d53b3e92c39c6b03f9af4e3d1f2748b21c309ad92ca4b","version":3,"updated_at":"2026-05-07T07:33:36.504Z"},{"hash":"9f40a8062433342cebb5b8c6472baefc98bc43de3ff3d50b6916c3f0fc917232","version":4,"updated_at":"2026-05-08T14:21:14.536Z"}]', '83.49', 2, 'http://localhost:3000/previews/preview-092.jpg', null, '["https://youtu.be/MOCK0000060","https://youtu.be/MOCK0000061","https://youtu.be/MOCK0000062","https://youtu.be/MOCK0000063","https://youtu.be/MOCK0000064","https://youtu.be/MOCK0000065","https://youtu.be/MOCK0000066"]', 'ที่เหลือก็จดสิ่งนี้เข้าไปด้วย พอดีลบออกไป แต่มันน่าจะช่วยลดระยะเวลาการคิดได้เยอะอยู่

| Bit position       | 7     | 6     | 5     | 4     | 3     | 2     | 1     | 0     |
| ------------------ | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Binary exponential | $2^7$ | $2^6$ | $2^5$ | $2^4$ | $2^3$ | $2^2$ | $2^1$ | $2^0$ |
| Value if bit = 1   | 128   | 64    | 32    | 16    | 8     | 4     | 2     | 1     |

Make sure ว่าหา IP เป็น โดยการใช้ AND Method ด้วยจ้า (ใส่ไว้ให้แต่ว่ามันเล็กมองไม่ค่อยเห็นหรอก)', true, false, null, 'approved', 1, '2026-05-02 05:41:42', null, 198, 23, 1, 1, null, '2026-05-02 05:41:29', '2026-09-27 20:43:00.437449', false, null, false, null, null, ARRAY['Final']), (80, 'Everything in Network Lecture', '- No CRC
- Review alongside your notes before exam day.', 'CSS334', '2', null, 'Year 3', 'Final', '199.00', 'cheatsheets/mock-062.pdf', null, 1, null, '3.04', 2, 'http://localhost:3000/previews/preview-093.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-03 06:15:19', null, 57, 0, 12, 1, null, '2026-05-03 06:14:26', '2026-09-28 09:24:12.022654', false, null, false, null, null, ARRAY['Final']), (81, 'Software Engineering: It Works on My Machine', '**Final Version Update (9:41 PM)** 🎉🎉🎉🎉🎉🎉
The final version of the cheat sheet has now been **uploaded**.
- For those who requested printing, your copies will be printed accordingly.  
- If you didn’t request printing and won’t be able to print tomorrow, I have a limited number of spare copies available.

> Feel free to DM me if you need one!

---

## What’s inside?

This cheat sheet covers key topics from:

- Chapter 4 — UML Diagrams  
- Chapter 5 — Enterprise Architecture (EA)  
- Chapter 6 — UX/UI  
- Chapter 7 — Software Quality & Quality Assurance (QA)  
- Chapter 8 — Software Testing  
- Chapter 8.5 — White-Box Testing  
- Chapter 9 — Software Project Management', 'CSS323', '2', '2025', 'Year 3', 'Final', '178.00', 'cheatsheets/mock-063.pdf', null, 1, null, '64.60', 4, 'http://localhost:3000/previews/preview-072.jpg', null, '["https://youtu.be/MOCK0000067","https://youtu.be/MOCK0000068","https://youtu.be/MOCK0000069","https://youtu.be/MOCK0000070","https://youtu.be/MOCK0000071","https://youtu.be/MOCK0000072"]', null, true, false, null, 'approved', 1, '2026-05-03 09:09:15', null, 163, 20, 1, 1, null, '2026-05-03 09:09:05', '2026-10-11 04:44:36.869852', false, null, false, null, null, ARRAY['Final']), (82, 'Big Data Analytics - Final Cheatsheet', '# DES431 - Big Data Analytics and Machine Learning!!!
- Taught by **Aj. Cholwich Nattee**
- **4 Pages**; Containing Summary + Example + Practice Questions

**แถมฟรี Sudoku ฆ่าเวลา!!**', 'DES431', '2', null, 'Year 3', 'Final', '59.00', 'cheatsheets/mock-064.pdf', null, 1, null, '16.17', 4, 'http://localhost:3000/previews/preview-117.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-03 10:50:52', null, 179, 16, 136, 1, null, '2026-05-03 10:50:01', '2026-10-02 15:42:30.383132', false, null, false, null, null, ARRAY['Final']), (83, 'GTS210 - Survival guide', 'GTS210 Mathematics for Technologists ||| sec. Dr.Makhanov (open book) contains everything after midterm.', 'GTS210', '1', '2024', 'Year 2', 'Final', '99.00', 'cheatsheets/mock-065.pdf', null, 1, null, '27.54', 10, 'http://localhost:3000/previews/preview-123.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-03 18:44:37', null, 56, 1, 17, 1, null, '2026-05-03 18:23:11', '2026-09-27 08:42:33.0351', false, null, false, null, null, ARRAY['Final']), (84, 'Everything Cloud (Google''s Version)', '> ตอนนี้กำลังหาทางที่ดีที่สุดที่ทุกคนสามารถนำ Cheat Sheet นี้ไปใช้ต่อได้ เช่น ให้เป็นไฟล์ Figma ไปแก้ไขได้อย่างง่าย ~~แต่ขอคิดดูก่อนแปปนึง รออัปเดตด้วยน้า~~

> **Update:** ข้อสรุปจากการไปคิด ๆ มา คือฉันไม่สามารถให้ไฟล์แบบย่อแล้วเป็น 4 หน้าได้ เพราะว่ามันจะเหมือนกันเกินไป -> ดังนั้นสิ่งที่ให้ได้คือไฟล์ Figma ที่เป็นแบบ 9 หน้า ให้เอาไปย่อกันเองเหลือ 4 หน้า นี่ถือว่าเป็นแค่ของแถม (พยายามเปลี่ยนสี เปลี่ยน Font ให้ด้วย เดี๋ยวเราจะซวยกันหมด)

https://example.com/figma-file (ใครที่ซื้อไปสามารถ DM: @peanut.sheets มาขอรหัสได้น้า)

### Important Note
This cheat sheet **cannot be used directly in exams**. You are required to create your own version, as submitted cheat sheets must not be identical.
___

## Cloud Computing Cheat Sheet

This cheat sheet compiles content from the following chapters:

- Chapter 8 — Resource Management & VM CPU Schedulers (VM Scheduling)  
- Chapter 9 — NoSQL and Big Data Processing  
- Chapter 10 — Apache Pig, Hive, and ZooKeeper  
- Chapter 11 — Akka and Kafka  
- Chapter 12 — Requirements for Secure, Multi-Tenant Hadoop (Apache YARN)  
- Chapter 13 — Mobile Cloud Computing  
- Chapter 14 — Edge Computing and Fog Computing  
- Chapter 15 — Cloud Security and Privacy', 'CSS451', '2', '2025', 'Year 3', 'Final', '89.00', 'cheatsheets/mock-066.pdf', 'f414876c34532800185ebd3f3166cbadf66fd7faf0b305d01e72ebf57fb77405', 2, '[{"hash":"f414876c34532800185ebd3f3166cbadf66fd7faf0b305d01e72ebf57fb77405","version":2,"updated_at":"2026-05-06T16:39:11.055Z"}]', '60.59', 4, 'http://localhost:3000/previews/preview-095.jpg', null, null, 'รหัสคือ `6dfaf5a8671fe99ad628ce1747d370a63c71fd0fa44597ea35d06e6cdde30183` สามารถ Duplicate หรือ Copy เอาออกไปทำข้างนอกเองได้เลย ไฟล์นี้ View only (มีอะไรด่วนโทรมา 095-6388462 (2 รอบ) อนุญาตนอนก่อน)', true, false, null, 'approved', 1, '2026-05-04 06:45:02', null, 109, 9, 1, 1, null, '2026-05-04 06:44:50', '2026-10-06 05:57:56.457265', false, null, false, null, null, ARRAY['Final']), (85, 'BAS357 Quick formulas recall', 'วิชานี้เอา cheat sheet เข้าห้องสอบไม่ได้นะ
รู้แล้วว่าเอาเข้าห้องสอบไม่ได้ แต่ทำไว้สำหรับใครที่ต้องการทบทวนสูตรอย่างรวดเร็ว', 'BAS357', '2', '2025', 'Year 3', 'Final', '30.00', 'cheatsheets/mock-067.pdf', null, 1, null, '9.71', 2, 'http://localhost:3000/previews/preview-052.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-04 20:22:04', null, 43, 0, 17, 1, null, '2026-05-04 20:19:32', '2026-09-26 11:09:09.480387', false, null, false, null, null, ARRAY['Final']), (86, 'Algorithms Design Final', 'Sec. Aj Suparchoek, 
Step by step อย่างดี

# Algorithm Final Topics
## 1. Divide and Conquer
## 2. Dynamic Programming
- Coin Changing Problem
- 0/1 Knapsack Problem
- Hamiltonian Circuit
- Matrix Chain Multiplication
- Warshall’s Algorithm
- Floyd’s Algorithm
- Reliability Design

## 3. Coping with the Limitations of Algorithm Power
- Backtracking
- Branch and Bound

## 4. String Matching Algorithm
- Horspool’s Algorithm

## 5. P, NP, NP-Complete', 'DES227', '2', '2024', 'Year 2', 'Final', '65.00', 'cheatsheets/mock-068.pdf', null, 1, null, '7.26', 2, 'http://localhost:3000/previews/preview-101.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-05 04:50:14', null, 37, 2, 2, 1, null, '2026-05-05 04:49:54', '2026-09-29 04:39:08.864136', false, null, false, null, null, ARRAY['Final']), (87, 'Full Summary and Beyond | DES431 Big Data Analytics and Machine Learning', '- Includes all topic covered in in the entire class (midterm + final).
- Includes topics taught in other classes.
- Includes topics not taught in any class.
- A lots of proof and mathematical notation.
- Contains no example nor exercise. Just pure content.
- Should not be used as cheat sheets unless you already understand all the content. In such a case, you would not need a cheat sheet anyway. 

**Let me know if you find any misinformation.**

### Future Works
- Add proofs for t-SNE
- Interpretation on KL Divergence', 'DES431', '2', '2025', 'Year 3', 'Final', '0.00', 'cheatsheets/mock-069.pdf', null, 1, null, '36.34', 9, null, null, null, null, true, false, null, 'approved', 1, '2026-05-05 07:39:26', null, 99, 17, 204, 1, null, '2026-05-05 07:10:05', '2026-10-11 04:39:17.232186', false, null, false, null, null, ARRAY['Final']), (88, 'Software Engineering: This Is All You Need', 'This cheat sheet contains:
- Lecture 5 - UML Diagrams
- Lecture 6 - Enterprise Architecture (EA)
- Lecture 7 - UX/UI
- Lecture 8 - Software Quality Assurance (SQA)
- Lecture 9 - Software Testing
- Lecture 10,11 - Whitebox Testing
- Lecture 12 - Software Project Management (SPM)', 'CSS323', '2', '2025', 'Year 3', 'Final', '99.00', 'cheatsheets/mock-070.pdf', null, 1, null, '41.74', 4, 'http://localhost:3000/previews/preview-073.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-05 09:38:35', null, 45, 0, 17, 1, null, '2026-05-05 09:16:45', '2026-09-26 11:09:09.480387', false, null, false, null, null, ARRAY['Final']), (89, 'CSS332 Microcontrollers - Cheat Sheet Final (ครึ่งแรก)', '- มีแค่ครึ่งแรกครึ่งเดียว แค่เนื้อหา Lecture 7-12
- อีกหน้าจำได้ว่าแปะวิธีทำผิดข้อนึงแต่จำไม่ได้ว่าอันไหน เลยไม่ได้ลงขาย😊', 'CSS332', '2', null, 'Year 2', 'Final', '0.00', 'cheatsheets/mock-071.pdf', null, 1, null, '11.10', 1, 'http://localhost:3000/previews/preview-088.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-06 03:30:30', null, 109, 24, 10, 1, null, '2026-05-06 03:29:54', '2026-09-30 03:43:34.128763', false, null, false, null, null, ARRAY['Final']), (90, 'Microcontrollers - Final Cheatsheet Taught by Aj.Bing', '# CSS332 - Microcontrollers and Applications!!
- **4 Pages**
- Covering **Lectures 7 - 13**
- มีทั้งสรุปเนื้อหา คำสั่งต่าง ๆ และตัวอย่างวงจร และตัวอย่างโค้ดรวบรวมจากหลากหลายแหล่ง!!
- **เก็งข้อสอบโดย SIIT32!!**', 'CSS332', '2', '2025', 'Year 2', 'Final', '59.00', 'cheatsheets/mock-072.pdf', 'fa658b8bd74241cc59196c88458b608259c82fba838ab171b7b31f0d2cdc47ea', 2, '[{"hash":"5f663c80558204c530498ea58be88c4b6b658c814c588143a0d80eb1289b527b","version":1,"updated_at":"2026-05-07T06:48:13.412Z"},{"hash":"fa658b8bd74241cc59196c88458b608259c82fba838ab171b7b31f0d2cdc47ea","version":2,"updated_at":"2026-05-07T16:59:08.547Z"}]', '52.18', 4, 'http://localhost:3000/previews/preview-089.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-06 23:48:36', null, 534, 94, 229, 1, null, '2026-05-06 23:48:13', '2026-10-01 06:20:00.779636', false, null, false, null, null, ARRAY['Final']), (91, 'Computer and Network Security - Bible for Finals (Open Book)', '# DES332 - Computer and Network Security!!
- Taught by Aj. Hung
- **17 Pages** - มีทั้งสรุปเนื้อหา คีย์สำคัญ โจทย์ และแบบฝึกหัด
- Based on practice from **SIIT31 & SIIT32**
- **รวม Cheatsheet 6 หน้า จากตอนมิดเทอม** เตรียมพร้อมสำหรับเนื้อหาต้นเทอม 30%', 'DES332', '2', '2026', 'Year 3', 'Final', '75.00', 'cheatsheets/mock-073.pdf', '0126116975c5caf7c0ba10ba67bba4ec5f4b85b4c2f14cef2e7e8d3ae43c9ce3', 4, '[{"hash":"1b5b13db3c6e7aceef36be42a23a5723069ea62dedd60386afa3ce87d64a5bfa","version":1,"updated_at":"2026-05-09T18:02:58.573Z"},{"hash":"4465378216c73fe4b727d7bf931b689e15631accc5bcd760b264ad8f14375d5f","version":2,"updated_at":"2026-05-11T15:34:40.248Z"},{"hash":"cf5b8102884145be20822f7dfb158e68af40539f70fe63bd971406c3c3c176c8","version":3,"updated_at":"2026-05-11T17:06:53.069Z"},{"hash":"0126116975c5caf7c0ba10ba67bba4ec5f4b85b4c2f14cef2e7e8d3ae43c9ce3","version":4,"updated_at":"2026-05-11T17:20:19.634Z"}]', '38.31', 15, 'http://localhost:3000/previews/preview-109.jpg', null, null, 'Apple notation = Important!!!!', true, false, null, 'approved', 1, '2026-05-09 15:57:03', null, 255, 26, 136, 1, null, '2026-05-09 11:02:58', '2026-09-27 05:11:26.790234', false, null, false, null, null, ARRAY['Final']), (92, 'Everything IS SAD (iykyk)', '# Systems Analysis & Design - Review Cheat Sheet

> This cheat sheet **cannot be brought into the exam**.  
> It is created for **reviewing and studying purposes only**.

> เดี๋ยวลงคลิปพูดไปเรื่อย ถ้ามีเวลา

## Contents

This cheat sheet summarizes key concepts from the following chapters:

- **Chapter 6:** Object Modeling
- **Chapter 7:** Development Strategies
- **Chapter 8:** User Interface Design
- **Chapter 9:** Data Design
- **Chapter 10:** System Architecture
- **Chapter 11:** Managing Systems Implementation

## Notes

- Designed for quick revision before exams
- Focuses on important concepts, frameworks, diagrams, and comparisons
- Best used alongside lecture slides and class notes', 'DES329', '2', '2026', 'Year 3', 'Final', '49.00', 'cheatsheets/mock-074.pdf', 'd89843f73abb9af85fdc1fb5fa0914a4b4741f4ba9275511e830ad8865490113', 1, '[{"hash":"d89843f73abb9af85fdc1fb5fa0914a4b4741f4ba9275511e830ad8865490113","version":1,"updated_at":"2026-05-10T03:01:59.934Z"}]', '42.50', 6, 'http://localhost:3000/previews/preview-108.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-09 20:02:10', null, 83, 9, 1, 1, null, '2026-05-09 20:01:59', '2026-10-02 10:38:36.03937', false, null, false, null, null, ARRAY['Final']), (93, 'Full Summary and Beyond | DES332 Computer and Network Security', '- Includes all topic covered in in the entire class (midterm + final).
- Includes additional topics: ECC+proof, Post-Quantum cryptography+proof, CP-ABE, and Full RSA proof
- Elegantly written in mathematical notations
- Contains no example nor exercise. Just pure content.
- Should not be used as cheat sheets unless you already understand all the content. In such a case, you would not need a cheat sheet anyway.

**Let me know if you find any misinformation. I am willing to correct it.**

**Future Works**
- Add proofs for CP-ABE
- Post-Quantum Lattice-based CP-ABE', 'DES332', '2', '2025', 'Year 3', 'Final', '0.00', 'cheatsheets/mock-075.pdf', 'e91e63e6d11693735c8f11886a07c2442bc2c556e5de8957213ac452913d067d', 2, '[{"hash":"9706a362fe16cb4475d07ad9fa1ccccc4529fa50a47121553e820d194d3a0c0f","version":1,"updated_at":"2026-05-10T11:42:52.810Z"},{"hash":"e91e63e6d11693735c8f11886a07c2442bc2c556e5de8957213ac452913d067d","version":2,"updated_at":"2026-05-10T12:19:13.637Z"}]', '52.61', 12, 'http://localhost:3000/previews/preview-110.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-10 04:43:23', null, 78, 15, 204, 1, null, '2026-05-10 04:42:52', '2026-09-27 05:11:29.334674', false, null, false, null, null, ARRAY['Final']), (94, 'Security: Zero Trust, Zero Sleep', 'The **CSS454: Computer and Communication Security (Final) Cheat Sheet** is now available ✨

Topics included:

* Post-Quantum Cryptography (PQC)
* Access Control / Authorization
* Operating System Security
* Database Security
* Internet Security Protocols & Standards
* Intrusion Detection Systems (IDS)
* Firewalls & Intrusion Prevention Systems (IPS)
* ISO 27001:2022 Concepts & Implementations

✅ Completed **4-page cheat sheet PDF** has been uploaded ✅

---

## Important Note

This cheat sheet **cannot be used directly in exams**.

You are required to create your own version, as submitted cheat sheets must not be identical.

The provided file is intended for reviewing, summarizing, and helping you design your own personalized version.

(Figma link provided separately.)', 'CSS454', '2', '2025', 'Year 3', 'Final', '155.00', 'cheatsheets/mock-076.pdf', 'e12174d441ecad5161e0d3e65701b80695ecd9e74b2cb6662401f64ef1d38e95', 4, '[{"hash":"4f815120c09309c23199ea9fd48e3310daa558c27a9069f62ff8a583980b3925","version":1,"updated_at":"2026-05-10T16:28:27.255Z"},{"hash":"080f9018eb669c3f14d23b61d4b847556f1459cbb72e7efb0007f7a11da7edbe","version":2,"updated_at":"2026-05-11T08:30:30.301Z"},{"hash":"f821561c7bd7f6aa4df05e11a71ddf98af81a8065870fba65c8b246fa9e268b5","version":3,"updated_at":"2026-05-11T10:54:13.429Z"},{"hash":"e12174d441ecad5161e0d3e65701b80695ecd9e74b2cb6662401f64ef1d38e95","version":4,"updated_at":"2026-05-11T14:11:37.097Z"}]', '59.16', 4, 'http://localhost:3000/previews/preview-097.jpg', null, null, '* ตอนนี้ได้ลงไฟล์ PDF (4 หน้า) เรียบร้อยแล้วว!!! ✅✅✅✅
* แต่จะ **ไม่มีไฟล์ Figma เวอร์ชัน 4 หน้า** ให้น้าา เพราะมันจะเหมือนกันเกินไปเกินไป 🫠 (วิธีการย่อใน Figma ก็คลุมทั้งหมด แล้วก็ Group ก่อนก็ได้แล้วกด K เปลี่ยนเครื่องมือ แล้วย่อได้เลย ไม่มีปัญหา — สลับเครื่องมือระหว่าง K & V บ่อย ๆ)
* เอา PDF 4 หน้า ไปเทียบได้ good luck!

[Figma File](https://example.com/figma-file) (สามารถกด Duplicate ออกไปแก้ไขเพิ่มเติมเองได้เลยย อันนี้เป็น View-only น้า)

รหัส `steam-fray-gray-polar`

> แก้ Font + ขนาดตัวหนังสือ + สี ก่อนนำเข้าห้องสอบด้วย ไม่งั้นพัง 😭', true, false, null, 'approved', 1, '2026-05-10 09:29:16', null, 108, 10, 1, 1, '2026-05-11 08:30:00', '2026-05-10 09:28:27', '2026-10-12 11:18:05.634272', false, null, false, null, null, ARRAY['Final']), (95, 'Operating Systems - Midterm Cheatsheet Taught by Aj. Seksan', '**CSS225 - Operating System**
- **2 Pages**
- Covering **Lectures 1 - 5**
- รวมทุกเรื่องสำคัญของ OS ทั้ง Process, Thread, Scheduling, Memory แบบกระชับ!', 'CSS225', '2', '2025', 'Year 2', 'Midterm', '39.00', 'cheatsheets/mock-077.pdf', '6f1632a55b925d901d567ddbd9ee1a1800e6a5b56bf008ad6940cbbfb961dd62', 1, '[{"hash":"6f1632a55b925d901d567ddbd9ee1a1800e6a5b56bf008ad6940cbbfb961dd62","version":1,"updated_at":"2026-05-22T16:15:42.627Z"}]', '8.09', 2, 'http://localhost:3000/previews/preview-066.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-31 19:10:53', null, 8, 0, 229, 1, null, '2026-05-22 09:15:42', '2026-09-26 11:09:09.480387', false, null, false, null, null, ARRAY['Midterm']), (96, 'CSS324 Artificial Intelligence - Midterm Cheatsheet!!', '# CSS324 - Artificial Intelligence!!!
- Taught by **Aj. Cholwich Nattee**
- **4 Pages**; Containing Summary + Example + Practice Questions
- **Contains:** Introduction to AI, Problem Solving by Search, Uninformed Search, Informed Search, Local Search, Adversarial Search (Game Playing), First-Order Logic, Constraint Satisfaction Problems
- เก็งตรงแทบทุกข้อ โดย **SIIT32 ที่เคยได้ A**', 'CSS324', '1', '2026', 'Year 3', 'Midterm', '59.00', 'cheatsheets/mock-078.pdf', '1859f74600a915a63c473d2155fe521f6eb8bf00248e7a903fe5438df785b35f', 1, '[{"hash":"1859f74600a915a63c473d2155fe521f6eb8bf00248e7a903fe5438df785b35f","version":1,"updated_at":"2026-05-22T16:31:22.038Z"}]', '9.74', 4, 'http://localhost:3000/previews/preview-080.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-31 19:10:48', null, 375, 60, 136, 1, null, '2026-05-22 09:31:22', '2026-10-03 05:42:39.377337', false, null, false, null, null, ARRAY['Midterm']), (97, 'Microcontrollers - Midterm Cheatsheet Taught by Aj.Bing', '**CSS332 - Microcontrollers and Applications**
- **2 pages**
- Covering **Lectures 1 - 6**
- รวมเนื้อหา Microprocessor/Microcontroller แบบครบ จบ อ่านก่อนสอบได้จริง
- สรุป Registers, I/O, Addressing, Flags, Stack แบบแน่น ๆ พร้อมทั้งตัวอย่างโค้ดจากในแลป', 'CSS332', '2', '2025', 'Year 2', 'Midterm', '39.00', 'cheatsheets/mock-079.pdf', '08758b7b41b83c37553f2fba73e7b70fa43602af776c6d0516ffa80739130719', 1, '[{"hash":"08758b7b41b83c37553f2fba73e7b70fa43602af776c6d0516ffa80739130719","version":1,"updated_at":"2026-05-22T16:33:07.712Z"}]', '5.13', 2, 'http://localhost:3000/previews/preview-091.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-31 19:10:46', null, 5, 0, 229, 1, null, '2026-05-22 09:33:07', '2026-09-26 11:09:09.480387', false, null, false, null, null, ARRAY['Midterm']), (98, 'Introduction to Data Communication - Midterm Cheatsheets', '# DES232 - Introduction to Data Communication!!!
- Taught by **Aj. Suparchoek Wangmanaopituk**
- **2 Pages**; Containing Summary + Examples + Diagrams
- **เก็งข้อสอบโดย SIIT32 ที่เคยได้ A**', 'DES232', '1', '2025', 'Year 3', 'Midterm', '39.00', 'cheatsheets/mock-080.pdf', '7535ebd813b6c5dcc7e8222553bb4a477ebd185a36881eaa1881fc478deb62a6', 1, '[{"hash":"7535ebd813b6c5dcc7e8222553bb4a477ebd185a36881eaa1881fc478deb62a6","version":1,"updated_at":"2026-05-22T16:36:59.712Z"}]', '6.08', 2, 'http://localhost:3000/previews/preview-107.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-31 19:10:42', null, 215, 31, 136, 1, null, '2026-05-22 09:36:59', '2026-09-27 05:11:24.631711', false, null, false, null, null, ARRAY['Midterm']), (99, 'Introduction to Data Communication - Final Cheatsheets', '# DES232 - Introduction to Data Communication!!!
- Taught by **Aj. Suparchoek Wangmanaopituk**
- **4 Pages**; Containing Summary + Examples + Diagrams
- **เก็งข้อสอบโดย SIIT32 ที่เคยได้ A**', 'DES232', '1', '2025', 'Year 3', 'Final', '59.00', 'cheatsheets/mock-081.pdf', '12627f82f15d1d83f2e25a0314ae0befb311a091e68088abaae87e85bd536be1', 1, '[{"hash":"12627f82f15d1d83f2e25a0314ae0befb311a091e68088abaae87e85bd536be1","version":1,"updated_at":"2026-05-22T16:45:33.194Z"}]', '19.40', 4, 'http://localhost:3000/previews/preview-106.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-31 19:10:39', null, 18, 0, 136, 1, null, '2026-05-22 09:45:33', '2026-09-26 11:09:09.480387', false, null, false, null, null, ARRAY['Final']), (100, 'General Science - Midterm Cheatsheet Taught by Aj. Chariya', '**SCS141 - General Science**
- **2 pages**
- Covering **Lectures 1 - 7**
- รวมเนื้อหาเคมีพื้นฐานแบบครบ อ่านทวนก่อนสอบได้จริง 
- ครบทั้ง mole, bonding, acid-base, equations และสูตรสำคัญ', 'SCS141', '1', '2024', 'Year 1', 'Midterm', '39.00', 'cheatsheets/mock-082.pdf', '18ceb7d101359de1106ebd25651938900c03cc726a3930fc1454ea23259d6db6', 1, '[{"hash":"18ceb7d101359de1106ebd25651938900c03cc726a3930fc1454ea23259d6db6","version":1,"updated_at":"2026-05-22T16:50:07.543Z"}]', '4.44', 2, 'http://localhost:3000/previews/preview-130.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-31 19:10:36', null, 319, 45, 229, 1, null, '2026-05-22 09:50:07', '2026-10-11 06:02:57.839233', false, null, false, null, null, ARRAY['Midterm']), (101, 'Big Data Analytics - Midterm Cheatsheet!!', '# DES431 - Big Data Analytics and Machine Learning!!!
- Taught by **Aj. Cholwich Nattee**
- **4 Pages**; Containing Summary + Example + Practice Questions', 'DES431', '2', '2025', 'Year 3', 'Midterm', '59.00', 'cheatsheets/mock-083.pdf', 'cab4a9965f22067698ad83f8337ff964ac545093c2d793372557aad29eb41869', 1, '[{"hash":"cab4a9965f22067698ad83f8337ff964ac545093c2d793372557aad29eb41869","version":1,"updated_at":"2026-05-22T16:52:41.421Z"}]', '12.62', 4, 'http://localhost:3000/previews/preview-118.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-31 19:10:31', null, 31, 1, 136, 1, null, '2026-05-22 09:52:41', '2026-09-27 06:26:06.19875', false, null, false, null, null, ARRAY['Midterm']), (102, 'Scientific Computing - Midterm Cheatsheets', '# CSS322 - Scientific Computing!!!
- Taught by **Dr. Gun**
- **4 Pages**; Containing Summary + Example + Practice Questions
- เก็งโดย **SIIT32 ที่เคยได้เต็ม**', 'CSS322', '1', '2025', 'Year 3', 'Midterm', '59.00', 'cheatsheets/mock-084.pdf', 'c1fde97d4d265fea829abc13614ef42473d58c4186137c85090b312485097ca1', 1, '[{"hash":"c1fde97d4d265fea829abc13614ef42473d58c4186137c85090b312485097ca1","version":1,"updated_at":"2026-05-22T16:58:18.022Z"}]', '6.02', 4, 'http://localhost:3000/previews/preview-071.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-31 19:10:27', null, 204, 28, 136, 1, null, '2026-05-22 09:58:18', '2026-10-09 10:52:10.337288', false, null, false, null, null, ARRAY['Midterm']), (103, 'Discrete Math - Final Cheatsheet Taught by Aj. Rawee', '**DES201 - Discrete Math**
- **2 pages**
- Covering **Lectures 4 - 8**
- อ่านไว เข้าใจง่าย เน้น concept + วิธีคิด 
- Recurrence, Graph, Algorithm สรุปจบในชีทเดียว
- ชีทเดียวเอาอยู่ทั้ง Big-O ยัน DFS/BFS
- **ปีที่แล้วอจ.ไม่ให้แปะรูปในชีทๆ + ไม่ให้ใช้ของเพื่อนปริ้นเข้าห้องสอบ (อันนี้ไว้ใช้เป็นเรฟในการทำได้คับ)**', 'DES201', '1', '2025', 'Year 2', 'Final', '39.00', 'cheatsheets/mock-085.pdf', '03cfb410ee8b4013e992ef9e9e534805077915c88e13f2b3900b81ce252707a9', 1, '[{"hash":"03cfb410ee8b4013e992ef9e9e534805077915c88e13f2b3900b81ce252707a9","version":1,"updated_at":"2026-05-22T16:58:21.581Z"}]', '2.51', 2, 'http://localhost:3000/previews/preview-099.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-31 19:10:23', null, 24, 4, 229, 1, null, '2026-05-22 09:58:21', '2026-09-27 08:42:10.581679', false, null, false, null, null, ARRAY['Final']), (104, 'Scientific Computing - Final Cheatsheets', '# CSS322 - Scientific Computing!!!
- Taught by **Dr. Gun**
- **4 Pages**; Containing Summary + Example + Practice Questions', 'CSS322', '1', '2025', 'Year 3', 'Final', '59.00', 'cheatsheets/mock-086.pdf', '8c28bf372f8c744fda7b395f5db6b6eb1b9ee03cef24406715eb9537be8f0a2f', 1, '[{"hash":"8c28bf372f8c744fda7b395f5db6b6eb1b9ee03cef24406715eb9537be8f0a2f","version":1,"updated_at":"2026-05-22T17:01:48.431Z"}]', '15.41', 4, 'http://localhost:3000/previews/preview-069.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-31 19:10:19', null, 35, 1, 136, 1, null, '2026-05-22 10:01:48', '2026-10-11 04:38:28.206551', false, null, false, null, null, ARRAY['Final']), (105, 'Discrete Math - Midterm Cheatsheet Taught by Aj. Rawee', '**DES201 - Discrete Math**
- **1 pages**
- Covering **Lectures 1 - 3**
- สรุป discrete แบบกระชับ แต่เก็บครบทุกจุดสำคัญ
- รวม Set, Logic, Relation, Function, Proof แบบครบจบในแผ่นเดียว
- **ปีที่แล้วอจ.ไม่ให้แปะรูปในชีทๆ + ไม่ให้ใช้ของเพื่อนปริ้นเข้าห้องสอบ (อันนี้ไว้ใช้เป็นเรฟในการทำได้คับ)**', 'DES201', '1', '2025', 'Year 2', 'Midterm', '29.00', 'cheatsheets/mock-087.pdf', '13a73c8e0615e72fb3d2d84c80d5cd8e4e9f8dee954f34f2dfcb9daa40d33c07', 1, '[{"hash":"13a73c8e0615e72fb3d2d84c80d5cd8e4e9f8dee954f34f2dfcb9daa40d33c07","version":1,"updated_at":"2026-05-22T17:12:58.991Z"}]', '1.37', 1, 'http://localhost:3000/previews/preview-100.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-31 19:10:13', null, 159, 19, 229, 1, null, '2026-05-22 10:12:58', '2026-10-06 02:09:50.930803', false, null, false, null, null, ARRAY['Midterm']), (106, 'Artificial Intelligence- Final Cheatsheets', '# CSS324 - Artificial Intelligence!!!
- Taught by **Aj. Cholwich Nattee**
- **4 Pages**; Containing Summary + Example + Practice Questions
- เก็งตรงแทบทุกข้อ โดย **SIIT32 ที่เคยได้ A**', 'CSS324', '1', '2025', 'Year 3', 'Final', '59.00', 'cheatsheets/mock-088.pdf', '76c342b5e57e77a721db8e846f3298be576dc1140e946ef143197843435d805c', 1, '[{"hash":"76c342b5e57e77a721db8e846f3298be576dc1140e946ef143197843435d805c","version":1,"updated_at":"2026-05-22T17:24:12.292Z"}]', '39.03', 4, 'http://localhost:3000/previews/preview-079.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-31 19:10:10', null, 65, 2, 136, 1, null, '2026-05-22 10:24:12', '2026-10-11 04:43:50.040669', false, '2026-07-13 17:43:49.385015', false, null, null, ARRAY['Final']), (107, 'Introduction to Computers - Lab Midterm Cheatsheet', '**GTS123 - Introduction to Computers and Programming**
- **2 pages**
- เจาะลึกฟังก์ชันพื้นฐาน: Math, String, Range, Random
- หน้า 2 จะมีตัวอย่างโค้ดจัดเต็ม: มี Sample Code จากโปรแกรมจริง + Output ให้เห็นภาพชัดเจน ไม่ต้องเดา (เอามาจาก practice ของอจ.)
- เอาไว้ใช้สำหรับสอบแลป
- **แถมฟรี Cheatsheet 2 หน้าสำหรับ Lecture**', 'GTS123', '1', '2024', 'Year 1', 'Midterm', '39.00', 'cheatsheets/mock-089.pdf', 'f132def01fa2c6609402ab52919681072c7c4658e688a6fedb731159b85d271f', 1, '[{"hash":"f132def01fa2c6609402ab52919681072c7c4658e688a6fedb731159b85d271f","version":1,"updated_at":"2026-05-22T17:36:19.499Z"}]', '3.83', 2, 'http://localhost:3000/previews/preview-121.jpg', null, null, 'https://example.com/drive-file', true, false, null, 'approved', 1, '2026-05-31 19:10:06', null, 243, 18, 229, 1, null, '2026-05-22 10:36:19', '2026-10-12 06:36:14.469843', false, null, false, null, null, ARRAY['Midterm']), (108, 'Introduction to Computer - Lab Final Cheatsheet', '**GTS123 - Introduction to Computers and programming**
- **2 pages**
- มีทั้งเรื่อง List, Dictionaries, Sets, Set Operations, ฟังก์ชัน (def), การวนลูป (while loop, break, continue) และคลังแสง NumPy Computing แบบจัดเต็ม
- หน้า 2 จะมีตัวอย่างโค้ดจัดเต็ม: มี Sample Code จากโปรแกรมจริง + Output ให้เห็นภาพชัดเจน ไม่ต้องเดา (เอามาจาก practice ของอจ.)
- เอาไว้ใช้สำหรับสอบแลป', 'GTS123', '1', '2024', 'Year 1', 'Final', '39.00', 'cheatsheets/mock-090.pdf', '0cc364386e3821c6715a0358a0387fdd18335edfd1868bd889eff0dfe689a85a', 1, '[{"hash":"0cc364386e3821c6715a0358a0387fdd18335edfd1868bd889eff0dfe689a85a","version":1,"updated_at":"2026-05-22T17:43:40.990Z"}]', '3.50', 2, 'http://localhost:3000/previews/preview-120.jpg', null, null, null, true, false, null, 'approved', 1, '2026-05-31 19:10:02', null, 49, 0, 229, 1, null, '2026-05-22 10:43:40', '2026-10-10 09:06:08.071471', false, null, false, null, null, ARRAY['Final']), (109, 'General Science - Final Summary Taught by Aj. Sompid', '**SCS141 - General Science**
- **11 pages**
- Covering **Lectures 1 - 6**
- รวมเนื้อหาชีวะพื้นฐานแบบครบ สามารถไว้ทวนก่อนสอบได้จริง
- สรุปย่อให้สั้นและเข้าใจง่ายภายใน 11 หน้า', 'SCS141', '1', '2024', 'Year 1', 'Final', '69.00', 'cheatsheets/mock-091.pdf', '869130bc6092a2375dea8b76f96f1547fe921233ca76dc74bb887eae1b6ab26e', 1, '[{"hash":"869130bc6092a2375dea8b76f96f1547fe921233ca76dc74bb887eae1b6ab26e","version":1,"updated_at":"2026-06-17T07:20:46.235Z"}]', '85.54', 12, 'http://localhost:3000/previews/preview-128.jpg', null, null, null, true, false, null, 'approved', 1, '2026-07-01 06:59:59', null, 59, 3, 229, 1, null, '2026-06-17 00:20:46', '2026-10-11 13:24:45.797182', false, null, false, null, null, ARRAY['Final']), (110, 'Critical Thinking - Midterm Summary Taught by Aj. Jasper', '**LAS101 - Critical Thinking**
- **11 pages**
- Covering **Lectures 1 - 7**
- รวมเทคนิคการคิดวิเคราะห์ คัดเนื้อหาสำคัญ ไม่มีน้ำ มีแต่เนื้อ!
- สรุปย่อให้สั้น ภาษาเข้าใจง่าย อ่านจบไว เอาไว้สปีดทวนก่อนเข้าห้องสอบได้จริง', 'LAS101', '1', '2025', 'Year 2', 'Midterm', '69.00', 'cheatsheets/mock-092.pdf', '3f3da0397e6b82c17510dbb22fee731ffff4e17fa455fb1ad913ebe59e90d2dc', 1, '[{"hash":"3f3da0397e6b82c17510dbb22fee731ffff4e17fa455fb1ad913ebe59e90d2dc","version":1,"updated_at":"2026-07-06T07:36:11.240Z"}]', '12.22', 12, 'http://localhost:3000/previews/preview-127.jpg', null, null, null, true, false, null, 'approved', 1, '2026-07-06 09:07:46', null, 235, 17, 229, 1, null, '2026-07-06 00:36:11', '2026-10-10 07:48:36.528768', false, null, false, null, null, ARRAY['Midterm']), (112, 'Chinese 1', 'ศัพท์ทั้งหมดในจีน 1 พร้อมคำอ่าน พินอิน และคำแปล

- ออกเสียงอักษร พยัญชนะ สระ วรรณยุกต์
- คำทักทายเบื้องต้นที่สำคัญ
- รากศัพท์ผสม
- ชื่อวิชาต่าง ๆ ชื่อประเทศ
- การนับจำนวน
- พูดคุยเกี่ยวกับครอบครัว
- พูดคุยเกี่ยวกับงานอดิเรก
- บอกเวลา', '2408101', null, null, 'Year 1', 'Midterm', '69.00', 'cheatsheets/mock-093.pdf', '6cb6751ba8ac4e4d71265ff4ba227e7968bd98cfb8970ab203ee641690210df6', 2, '[{"hash":"5448fb3f7d78dfc127e72532ddd45d35eaf1f65baca2d5502017bce9f727e12a","version":1,"updated_at":"2026-07-08T13:31:44.703Z"},{"hash":"6cb6751ba8ac4e4d71265ff4ba227e7968bd98cfb8970ab203ee641690210df6","version":2,"updated_at":"2026-07-10T16:39:54.690Z"}]', '16.00', 10, 'http://localhost:3000/previews/preview-050.jpg', null, null, 'Oral Test 2 Cheatsheet: https://example.com/drive-file

Tips:
1. 二 กับ 两 
- หลัก10 ใช้ 二
- หลัก 100 ใช้ได้ทั้งสอง
- หลัก 1000+ ใช้ 两

2. 想 กับ 要
- 想 เป็นแบบสุภาพ
- 要 เป็นสิ่งที่จำเป็นต้องทำ

3. 先 เกิดก่อน 再 เกิดหลัง', true, false, null, 'approved', 1, '2026-07-08 13:46:15.262991', null, 55, 0, 335, 2, '2026-07-10 02:00:00', '2026-07-08 13:31:44.670078', '2026-09-27 15:36:54.09024', false, null, false, null, null, ARRAY['Midterm','Final']), (113, 'Computer Graphics - Final Cheatsheet Taught by Aj.Samart (Additional Cheatsheet Version)', '**CSS221 - Computer graphics**
- **8 Pages**
- Covering **Lab 9-10, Lab practice, Exam practice, Midterm practice exam**
- จัดเรียงหน้ากระดาษให้อ่านง่าย มีหัวข้อบอกชัดเจน มีอธิบายโค้ดบางจุดเพื่อให้เข้าใจง่าย
- เป็น Additional Cheatsheet ที่เอาไว้ใช้กับ Cheatsheet ของอาจารย์', 'CSS221', '2', '2025', 'Year 2', 'Final', '59.00', 'cheatsheets/mock-094.pdf', 'ecbcba57942ab94026743062d97253bda3d5335dcb92d0071a1cd3e1c09b6806', 2, '[{"hash":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","version":1,"updated_at":"2026-07-09T03:22:30.730Z"},{"hash":"ecbcba57942ab94026743062d97253bda3d5335dcb92d0071a1cd3e1c09b6806","version":2,"updated_at":"2026-07-09T03:24:30.305Z"}]', '11.69', 8, 'http://localhost:3000/previews/preview-058.jpg', null, null, null, true, false, null, 'approved', 1, '2026-07-09 13:28:49.421646', null, 54, 1, 229, 1, null, '2026-07-09 03:22:30.688897', '2026-09-26 11:09:09.480387', false, null, false, null, null, ARRAY['Final']), (114, 'Theory of Computation - Midterm cheat sheet', 'CSS321 taught by Dr. Hung - **Open book exam**, contains past year exams and lecture notes about Sets and Finite Automata', 'CSS321', '1', '2025', 'Year 3', 'Midterm', '30.00', 'cheatsheets/mock-095.pdf', '11065cf3a778c8ea94c603269ac8e897a52b358fb89337a03f027d9cf6a226f4', 1, '[{"hash":"11065cf3a778c8ea94c603269ac8e897a52b358fb89337a03f027d9cf6a226f4","version":1,"updated_at":"2026-08-04T14:08:29.503Z"}]', '24.60', 15, 'http://localhost:3000/previews/preview-017.jpg', null, null, null, true, false, null, 'approved', 1, '2026-08-04 14:18:04.826163', null, 184, 24, 17, 1, null, '2026-08-04 14:08:29.549971', '2026-10-11 02:17:24.210365', false, null, false, null, null, ARRAY['Midterm']), (115, 'GTS131 - Midterm Summary', '# GTS131 - Circularity for Sustainable Development
- Taught by **Aj. Shu Han Tsu**
- **37 Pages**; Containing Summary (19 pages) & Practice (18 pages)
- **Contains the following topics:** Introduction to Circular Economy, Circularity of Metal, Circular of Ceramic, Circularity of Plastic and Composite, Product Design Thinking, Smart Electronic', 'GTS131', null, '2026', 'Year 1', 'Midterm', '79.00', 'cheatsheets/mock-096.pdf', '4b9d328a0691549b315077398622f9478c025c56730bc6c073ed38d2e577d93a', 2, '[{"hash":"fcc6bfa4773071143014a5d163b11d92509bd12fb4d57c103ff5d3a969c3a77b","version":1,"updated_at":"2026-09-07T11:15:00.808Z"},{"hash":"4b9d328a0691549b315077398622f9478c025c56730bc6c073ed38d2e577d93a","version":2,"updated_at":"2026-09-17T05:53:19.133Z"}]', '3.61', 37, 'http://localhost:3000/previews/preview-035.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-07 11:15:28.784237', null, 394, 26, 136, 1, null, '2026-09-07 11:15:00.796636', '2026-10-07 08:43:39.556054', false, null, false, null, null, ARRAY['Midterm']), (116, 'General Science Midterm', 'มี highlight ว่าตรงไหนในชีทออกด้วย ไม่รู้ตอนนี้เปลี่ยนไปยังนะ เรียนกับ Aj.Chariya', 'SCS141', '1', '2023', 'Year 1', 'Midterm', '45.00', 'cheatsheets/mock-097.pdf', 'd86d5a5a866b1f5f0909f0ac8c038e417da7f6fecdde27f7459075e5afbd58a7', 1, '[{"hash":"d86d5a5a866b1f5f0909f0ac8c038e417da7f6fecdde27f7459075e5afbd58a7","version":1,"updated_at":"2026-09-09T04:20:32.211Z"}]', '9.22', 4, 'http://localhost:3000/previews/preview-129.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-09 04:21:17.11458', null, 59, 2, 2, 1, null, '2026-09-09 04:20:32.187155', '2026-10-11 06:02:43.198101', true, '2026-09-09 04:22:48.092761', false, null, null, ARRAY['Midterm']), (117, 'แนวข้อสอบ JPN1201', 'มี 83 ข้อ จาก 100 ข้อ', 'JPN1201', '1', '2024', 'Year 1', 'Final', '20.00', 'cheatsheets/mock-098.pdf', 'c360cf286643354efb1438970028cb3d828f3de77cad9625e4fa2ee9b9378841', 1, '[{"hash":"c360cf286643354efb1438970028cb3d828f3de77cad9625e4fa2ee9b9378841","version":1,"updated_at":"2026-09-09T04:44:51.592Z"}]', '0.10', 6, 'http://localhost:3000/previews/preview-125.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-09 04:46:11.025941', null, 24, 1, 359, 4, null, '2026-09-09 04:44:51.554827', '2026-10-01 12:47:09.81003', false, null, false, null, null, ARRAY['Final']), (118, 'IoT: Deep Sleep, I Wanna Sleep', 'Everything you need to survive IoT without having to read every single lecture slide

- **Lecture 1-6**: IoT fundamentals, architectures, ESP32, multitasking, deep sleep, web servers/clients, and MQTT (Will keep updated krub!)
- **ESP32 & Code**: important functions, concepts, and code patterns
- **Quiz Badges**: highlighted topics that are appeared in quizzes, so you know what to pay extra attention to
- **Homework Section**: useful concepts and references for completing the course homework
- เดี๋ยวถ้ามีเวลา จะแถมคลิปพูดทั้ง Cheat Sheet
- ยังมีเพิ่มเติม รอก่อน 555', 'CSS452', '1', '2026', 'Year 4', 'Midterm', '199.00', 'cheatsheets/mock-099.pdf', '47d052bca985aa9d072876b1ee4bc88f0c7bbcca698ae177272b989973750ba5', 3, '[{"hash":"cad00cb5a517a876051d3a6662f2dcfda3a0725385733c3fd978e78271514966","version":1,"updated_at":"2026-09-12T15:11:22.989Z"},{"hash":"a99ee403c1e75497afd22e68202f87c42eee7bbab4136dbc4e99adc3f1020137","version":2,"updated_at":"2026-09-13T05:15:21.971Z"},{"hash":"47d052bca985aa9d072876b1ee4bc88f0c7bbcca698ae177272b989973750ba5","version":3,"updated_at":"2026-09-23T16:42:30.684Z"}]', '22.76', 2, 'http://localhost:3000/previews/preview-096.jpg', null, null, 'แนะนำให้ Print กับ Printer ที่ ห้องสมุด และ ศกร. เพื่อความชัดเจน และ Element ครบถ้วน (การ Print ที่ FastPrint อาจจะทำให้ Element บางอย่างหายไปได้)', true, false, null, 'approved', 1, '2026-09-12 15:11:37.257011', null, 152, 18, 1, 1, '2026-09-15 05:00:00', '2026-09-12 15:11:22.949084', '2026-10-08 01:42:24.025245', false, null, false, null, null, ARRAY['Midterm']), (119, 'BIG Data, Huge Data, Enormous!', '## DES431 Midterm Cheat Sheet —^— Contents
Aj. Apichon
>ฝากถึงเด็ก ๆ หลาน ๆ เขียนสิ่งนี้หลังจากสอบเสร็จ คือ มีหมดทุกอย่างแหละ อ่านแล้วตอบได้ แต่คำถามข้อสุดท้ายมันจะเกี่ยวกับ Technology AWS หน่อย ๆ ดังนั้น ใน Cheat Sheet นี้ไม่ค่อยได้ mention ถึงขนาดนั้น แต่ก็พอมีบ้าง และก็พอจำได้ในหัวบ้าง พวก AWS Glue, AWS Athena, AWS S3 มันคืออะไร ทำงานด้วยกันอย่างไรได้ ก็ควรใส่เข้าไปนะะะ (ถ้ามีเวลาเดี๋ยวเพิ่มให้ แต่คงไม่มีแหละ เวลาน่ะ)
1. Lecture 1 – Introduction
2. Lecture 2 – Data and Data Management
3. Lecture 3 – Data and Data Management II
4. Lecture 4 – Data Preprocessing
5. Lecture 5 – Big Data Framework
6. Lecture 6 – MapReduce Framework and Programming
- ด้านหลังมี Supplementary Notes ใส่ให้เพิ่มเติมหลายอย่าง (เช่น การทำ Data Cleaning, RAID คำนวณอย่างไร, RapidMiner Operator แต่ละตัว ซึ่งในข้อสอบจริงไม่ได้ใช้555, RapidMiner Standard Pipeline ต่าง ๆ)
- Mock Exam Solution', 'DES431', '1', '2026', 'Year 4', 'Midterm', '189.00', 'cheatsheets/mock-100.pdf', '7ff95476264e3a0a4c42542e9482db30844d6c5be09c42ab8ea00673f4474911', 5, '[{"hash":"ddfac5d05922b764b803cd3202283c1fd83ef5357d47b7c06318bcba5e17d77c","version":1,"updated_at":"2026-09-13T09:16:39.245Z"},{"hash":"41e9a0b5cd82bd0cc0cbace79007b34915ff7261c66973d871eeca370f88d4f5","version":2,"updated_at":"2026-09-18T14:24:46.918Z"},{"hash":"ee1445727cd246037185eca806fece309db3c88b9be160cf095f36978a5c8699","notes":"- ปรับให้เหมาะกับการ Print มากขึ้น - เน้น ตัวหนาสำหรับส่วนของ Code เพื่อให้ไล่อ่านและเขียนตามได้ง่ายขึ้น\\r\\n- แก้ไข LaTeX formatting ให้เรียบร้อยและอ่านง่าย\\r\\n- เพิ่ม Supplementary Notes สำหรับใช้เป็น Reference ได้ตอนสอบ\\r\\n    - RapidMiner Operators ที่เคยใช้ใน Homework 1-2\\r\\n    - RAID formulas ต่าง ๆ จาก PCS133 (จาก Cyber 555)\\r\\n    - RapidMiner Standard Pipelines ที่เจอบ่อย ๆ พร้อมไว้ใช้เป็น Reference\\r\\n\\r\\nถ้าอยากได้ เวอร์ชันที่ครบที่สุด แนะนำรอ Print พรุ่งนี้ เพราะกำลังเพิ่มอีกนิดหน่อย:\\r\\n- Data Cleaning\\r\\n- MapReduce - อาจารย์บอกว่าออกเยอะ + Applications ของ MapReduce\\r\\n- เฉลย Mock Exam\\r\\n- Homework อีก\\r\\n\\r\\nถ้าอยาก Print วันนี้ก็ได้ ยังเหลือพื้นที่ให้จดเพิ่มเติมได้อีกเยอะ ✍️\\r\\nแต่ถ้าไม่ได้รีบ แนะนำ รอพรุ่งนี้ จะได้เวอร์ชันที่เนื้อหาครบกว่าาา ฮ่าฮ่าา","version":3,"updated_at":"2026-09-24T12:20:42.447Z"},{"hash":"940d97d2420b95da648b44edaac2553d4b7d5cfe268aef34c049330fb83eaff9","notes":"ใหม่ทุกอย่าง!! ฉบับเต็มมาแล้วครับบบบ","version":4,"updated_at":"2026-09-25T03:55:50.477Z"},{"hash":"7ff95476264e3a0a4c42542e9482db30844d6c5be09c42ab8ea00673f4474911","notes":"ปรับตัวหนังสือ + ขยายภาพให้ใหญ่มากขึ้น หลังจากพิมพ์จริง น่าจะเวอร์ชันสุดท้ายแล้ว","version":5,"updated_at":"2026-09-25T05:29:46.510Z"}]', '52.14', 2, 'http://localhost:3000/previews/preview-032.jpg', null, '["https://youtu.be/MOCK0000073","https://youtu.be/MOCK0000074"]', '(มีคนแจ้งมา) กรุณา Print สิ่งนี้ที่ ห้องหมุด/ ศกร. เหตุผล
1. มาใช้โควต้าของเราให้คุ้ม ๆ
2. Print บางที่ที่กาก ๆ อาจจะทำให้ Element บางอย่างหายไปได้', true, false, null, 'approved', 1, '2026-09-13 09:16:56.585787', null, 130, 19, 1, 1, '2026-09-18 20:23:00', '2026-09-13 09:16:39.212872', '2026-10-12 20:42:06.123428', false, null, false, 'http://localhost:3000/previews/preview-014.jpg', 'http://localhost:3000/previews/preview-013.jpg', ARRAY['Midterm']), (120, 'CSS331 Data Communication Midterm Cheat Sheet', 'CSS331 Data Communication Midterm Cheat Sheet Sec. Aj. Sasiporn', 'CSS331', '1', null, 'Year 3', 'Midterm', '40.00', 'cheatsheets/mock-101.pdf', '1f0a076f02afd88ab25aed06de0f504483def10c78f4b4378179cb9dd701a3e7', 1, '[{"hash":"1f0a076f02afd88ab25aed06de0f504483def10c78f4b4378179cb9dd701a3e7","version":1,"updated_at":"2026-09-13T09:26:57.134Z"}]', '14.45', 2, 'http://localhost:3000/previews/preview-086.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-13 09:33:19.32976', null, 199, 33, 42, 1, null, '2026-09-13 09:26:57.100415', '2026-10-07 06:07:50.274965', false, null, false, null, null, ARRAY['Midterm']), (121, 'CSS322 Scientific Computing Midterm Cheat Sheet', 'CSS322 Scientific Computing Midterm Cheat Sheet Sec. Dr. Gun (เคยได้ A)', 'CSS322', '1', null, 'Year 3', 'Midterm', '40.00', 'cheatsheets/mock-102.pdf', '64181d5cb2bbaa734c3a69a34870bf5484e6efa8849f1cf38559a1a5925b55ae', 1, '[{"hash":"64181d5cb2bbaa734c3a69a34870bf5484e6efa8849f1cf38559a1a5925b55ae","version":1,"updated_at":"2026-09-13T09:37:10.502Z"}]', '9.07', 4, 'http://localhost:3000/previews/preview-070.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-13 09:37:32.952197', null, 80, 3, 42, 1, null, '2026-09-13 09:37:10.468797', '2026-10-08 19:39:07.777386', false, null, false, null, null, ARRAY['Midterm']), (122, 'CSS331 Data Communication Cheat Sheet', 'CSS331 Data Communication taught by Dr. Sasiporn', 'CSS331', '1', '2025', 'Year 3', 'Midterm', '40.00', 'cheatsheets/mock-103.pdf', '4af4fd8acdbbb63cb2ced8db493b846278a352e5d767b3fcee653617eed9ed04', 1, '[{"hash":"4af4fd8acdbbb63cb2ced8db493b846278a352e5d767b3fcee653617eed9ed04","version":1,"updated_at":"2026-09-14T09:54:55.340Z"}]', '9.97', 2, 'http://localhost:3000/previews/preview-085.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-14 09:56:07.503311', null, 158, 6, 17, 1, null, '2026-09-14 09:54:55.344654', '2026-10-11 02:16:18.515528', false, null, false, null, null, ARRAY['Midterm']), (123, 'DES324 - Midterm Cheatsheet', '# DES324 - Entrepreneurship for Digital Business
- Taught by **Aj.Teerayut** 
- **2 Pages**; Containing sessions 1 - 5
- With **summaries, formulas, tricks, and examples**', 'DES324', '1', '2026', 'Year 4', 'Midterm', '49.00', 'cheatsheets/mock-104.pdf', 'bb36c3500191882512a709b82b8b67a2ca7894d35efd3ca3da3501064343e307', 1, '[{"hash":"bb36c3500191882512a709b82b8b67a2ca7894d35efd3ca3da3501064343e307","version":1,"updated_at":"2026-09-16T13:41:23.145Z"}]', '4.14', 2, 'http://localhost:3000/previews/preview-027.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-16 13:41:49.16586', null, 133, 12, 136, 1, null, '2026-09-16 13:41:23.14372', '2026-10-09 10:52:18.124124', false, null, false, null, null, ARRAY['Midterm']), (124, 'MAS116 Practice Midterm Exam (Google''s)', '# MAS116 Practice Midterm Exam (Google''s Version)
- ไม่รู้ว่าเก่าแก่ไปยัง แต่ว่าอันนี้คือ Practice Midterm Exam ที่อาจารย์ Nirattaya Khamsemana แจกตอนนั้น
- ตั้งใจมาก + จัดหน้าสวยงาม (หน้าแรก ๆ พื้นหลังดำคือโจทย์, พาร์ทวิธีทำอยู่ด้านหลังพื้นหลังขาว)
- บางข้อมีวิธีทำอย่างละเอียดชัดเจน (+ หน้าตากราฟที่ตอนนั้นคือมองแล้วเห็นภาพสุด ๆ อะ) ดีที่สุดในโลก
- ไม่เข้าใจอะไรทักมาถามได้นะ แต่ไม่รู้ตอบได้ป่าว ลืมไปหมดแล้วอะ ตอนนั้นขยันเกิน ตอนนี้อาจจะยัง5555', 'MAS116', '1', '2023', 'Year 1', 'Midterm', '0.00', 'cheatsheets/mock-105.pdf', 'd3250332bd40ca0147fee12c0e34041f847c1788b4731b47baa0b0601a711da6', 1, '[{"hash":"d3250332bd40ca0147fee12c0e34041f847c1788b4731b47baa0b0601a711da6","version":1,"updated_at":"2026-09-16T15:05:55.023Z"}]', '6.53', 26, 'http://localhost:3000/previews/preview-037.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-16 15:06:05.358065', null, 57, 13, 1, 1, null, '2026-09-16 15:05:55.022685', '2026-10-10 07:47:44.54723', false, null, true, null, null, ARRAY['Midterm']), (125, 'GTS131 - Final Summary', '# GTS131 - Circularity for Sustainable Development
- Taught by **Dr. Sandhya Babel**
- **42 Pages**; Containing Summary (17 pages) & Practice (25 pages)
- **Contains the following topics:** Environment and Sustainability, Clean water and Sanitation for all, Sustainable cities and communities, Clean Energy, Climate Action, Electronic Waste', 'GTS131', '1', '2026', 'Year 1', 'Final', '79.00', 'cheatsheets/mock-106.pdf', '1e5d81bfb95cdeaaa2f32ff4a43c9a75dd65e1ce582b8bbf88adfe39024a5393', 1, '[{"hash":"1e5d81bfb95cdeaaa2f32ff4a43c9a75dd65e1ce582b8bbf88adfe39024a5393","version":1,"updated_at":"2026-09-17T05:58:12.663Z"}]', '3.13', 42, 'http://localhost:3000/previews/preview-034.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-17 05:58:46.594857', null, 26, 2, 136, 1, null, '2026-09-17 05:58:12.6168', '2026-10-03 06:50:58.205046', false, null, false, null, null, ARRAY['Final']), (126, '<Ethical Hacking> It''s ALL HERE.sh', '## <CSS484: Ethical Hacking> It''s ALL HERE.sh
- เนื้อหา**ครบหมดแล้วทั้ง 7 Lecture จริง ๆ** (แต่ Lecture สุดท้ายอาจจะย่อให้สั้น ๆ หน่อย เพราะมันไม่มีที่เหลือแล้ว ยัดมาหมดทุกอย่างแล้วจริง ๆ แบบจริงจังจอมแก่นเลย)
- โคตรเหนื่อย วิชานี้ ซ้ำไปมาอยู่นั่นแหละ555
1. Lecture 1 - Introduction to Ethical Hacking
2. Lecture 2 - Passive Reconnaissance & OSINT
3. Lecture 3 - Active Reconnaissance & Nmap
4. Lecture 4 - Web App Enumeration & Burp Workflow
5. Lecture 5 - Exploit Development
6. Lecture 6 - Buffer Overflows
7. Lecture 7 - DEP & Return-Oriented Programming

- เหลือย่อให้เหลือภายใน 2 หน้า และใส่ Workshop ทั้งหมดที่ทำภายในห้อง! (ไม่ได้ใส่รูป แต่อธิบายก็น่าจะเข้าใจน้า)
- **ก่อนเริ่มแต่ละบทใ่ส่ภาษาไทย สีชมพู อ่านต่อเนื่องเข้าใจง่าย ๆ ทำเพื่อตัวเอง แต่นี่มันถูกต้องเลย**', 'CSS484', '1', '2026', 'Year 4', 'Midterm', '229.00', 'cheatsheets/mock-107.pdf', '02460fed14f32f71c53bb1afbe25e3a87c25a6f280554093d2b9fab0895ecbf7', 2, '[{"hash":"600e8701badd8eb6be647f6220218895547c59b3e23c7669352b4263ffcbe450","version":1,"updated_at":"2026-09-17T07:40:19.654Z"},{"hash":"02460fed14f32f71c53bb1afbe25e3a87c25a6f280554093d2b9fab0895ecbf7","version":2,"updated_at":"2026-09-19T10:38:11.650Z"}]', '37.96', 2, 'http://localhost:3000/previews/preview-025.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-17 07:40:29.457984', null, 111, 16, 1, 1, '2026-09-19 03:38:00', '2026-09-17 07:40:19.606375', '2026-10-05 07:17:59.486386', false, null, false, null, null, ARRAY['Midterm']), (127, 'CSS452 IoT Midterm Cheat Sheet', 'CSS452 IoT Midterm Cheat Sheet Aj.Seksan (Cybersecurity Track)', 'CSS452', '1', null, 'Year 4', 'Midterm', '50.00', 'cheatsheets/mock-108.pdf', '6c33b961439c7052e3a1d75c049720ac02afef693271a1bc4aa1fe0326a918c9', 2, '[{"hash":"590433c27de5c44ccaa20979992297b082a85aed95fd051c471e20d846db363f","version":1,"updated_at":"2026-09-18T13:27:27.015Z"},{"hash":"6c33b961439c7052e3a1d75c049720ac02afef693271a1bc4aa1fe0326a918c9","version":2,"updated_at":"2026-09-19T14:01:40.905Z"}]', '17.80', 2, 'http://localhost:3000/previews/preview-022.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-18 13:27:46.863491', null, 66, 2, 42, 1, null, '2026-09-18 13:27:26.97325', '2026-10-02 06:02:10.767996', false, null, false, null, null, ARRAY['Midterm']), (128, 'DES324 Entrepreneurship for Digital Business + Practice Questions!', '## DES324 (Entrepreneurship for Digital Business) Midterm Cheatsheet
- Taught by **Aj.Teerayut**
- 2 Pages
- **All chapters + Practice questions ตามที่อาจารย์ guide** 
- เรียงเนื้อหาแบบเข้าใจง่าย

> ครบมาก ครบสุดๆ **ครบกว่านี้ไม่มีแล้ว!!**

(ตัวเล็กเพราะอัดแน่น แต่มองเห็นนะ 🔍)', 'DES324', '1', '2026', 'Year 4', 'Midterm', '139.00', 'cheatsheets/mock-109.pdf', 'a0750bfe7dd775ae99c67ebe39890f388bfcd83e2f2daf635bcce2f5f35c751d', 1, '[{"hash":"a0750bfe7dd775ae99c67ebe39890f388bfcd83e2f2daf635bcce2f5f35c751d","version":1,"updated_at":"2026-09-18T17:11:08.830Z"}]', '3.84', 2, 'http://localhost:3000/previews/preview-028.jpg', null, null, 'Color code

Pink - start of the section + what this section covers/ answers

Orange - key concepts

Violet - key wordings

*ถ้าเจอปัญหาอะไรหรือเนื้อหาผิดตรงไหน ทัก ig: _nnpx ได้เลยนะะ', true, false, null, 'approved', 1, '2026-09-18 17:20:54.078891', null, 189, 21, 411, 1, null, '2026-09-18 17:11:08.797612', '2026-10-05 07:18:26.885257', false, null, false, null, null, ARRAY['Midterm']), (129, 'General Science Midterm (Aj. Chariya)', '- Taught by Aj.Chariya
- สรุปเนื้อหา + รวมทุกสูตร ใช้อ่านทวนได้เลย

อ่านง่าย ลายมือสวย เนื้อหาครบบบ ✅✅

Written by รุ่นพี่ 🧐', 'SCS141', '1', '2023', 'Year 1', 'Midterm', '35.00', 'cheatsheets/mock-110.pdf', '581b2430bba44020dcc124866dcd44bfae17bd4020b57bf9bd7eb0ac6ce7e715', 1, '[{"hash":"581b2430bba44020dcc124866dcd44bfae17bd4020b57bf9bd7eb0ac6ce7e715","version":1,"updated_at":"2026-09-18T19:00:02.297Z"}]', '3.45', 2, 'http://localhost:3000/previews/preview-038.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-18 19:06:54.040742', null, 36, 5, 411, 1, null, '2026-09-18 19:00:02.245336', '2026-10-07 03:44:13.814942', false, null, false, null, null, ARRAY['Midterm']), (130, 'Theory of Computation Midterm Practice', 'All the practice questions were solved by me and me alone. So, please keep in mind that it is possible that some methods and answers are wrong! (even though I did try my best 😬) Also, there is a few solution missing simply because the questions are too difficult for me too (oops 😣). But anyways, really hope this can help you at least just a tiny bit :'')

Good luck and have lots of fun with your exam! Wishing all of you a 100/100 😉🍀💖', 'CSS321', '1', '2023', 'Year 3', 'Midterm', '0.00', 'cheatsheets/mock-111.pdf', '7508d805934e0991ff5340befae060f61c55ca207489f45bbf48faa7afef2776', 1, '[{"hash":"7508d805934e0991ff5340befae060f61c55ca207489f45bbf48faa7afef2776","version":1,"updated_at":"2026-09-19T12:08:37.467Z"}]', '14.17', 45, 'http://localhost:3000/previews/preview-015.jpg', null, '["https://youtu.be/MOCK0000075","https://youtu.be/MOCK0000076"]', null, true, false, null, 'approved', 1, '2026-09-19 12:09:14.694037', null, 320, 60, 19, 1, null, '2026-09-19 12:08:37.405284', '2026-10-09 04:28:09.783427', false, null, false, null, null, ARRAY['Midterm']), (131, 'DES221 Data Structure and Algorithm Lecture Midterm (FREE)', 'DES221 Data Structure and Algorithm Lecture Midterm Sec. Aj. Pakinee จดครบ', 'DES221', '1', null, 'Year 2', 'Midterm', '0.00', 'cheatsheets/mock-112.pdf', '0113a2619df1fa1b0226e5bd4eaa45075d60b6527c66ffd642354fb3e9a81bff', 1, '[{"hash":"0113a2619df1fa1b0226e5bd4eaa45075d60b6527c66ffd642354fb3e9a81bff","version":1,"updated_at":"2026-09-20T06:15:22.371Z"}]', '6.92', 207, null, null, null, null, true, false, null, 'approved', 1, '2026-09-20 06:15:46.845546', null, 38, 6, 42, 1, null, '2026-09-20 06:15:22.336586', '2026-09-28 17:33:36.485523', false, null, false, null, null, ARRAY['Midterm']), (132, 'Math III - Lecture Cheat Sheet', 'Lecture ของ Mathematics for Technologists III
แบ่งออกเป็น 2 column ให้แล้ว เผื่อเวลา Print
สอนโดยอาจารย์ Stanislav S. Makhanov

**Topics covered:**

* Linear Equations and Systems
* Determinants
* Vectors and Matrices
* Matrix Operations
* Matrix Multiplication
* Matrix Representation of Linear Systems
* Gauss Elimination (GE)
* Back Substitution
* Gauss-Jordan Elimination (GJE)
* Homogeneous Systems
* Free Variables and Infinite Solutions
* Inverse Matrices
* Properties of Matrix Arithmetic
* Identity Matrix
* Transpose and Symmetric Matrices
* Cramer''s Rule
* Lines and Planes

ตอนนั้นเหมือนจะ Open Book ก็ Print ทุกอย่างที่เป็นไปได้เข้าไป 5555', 'GTS210', '1', '2024', 'Year 2', 'Midterm', '0.00', 'cheatsheets/mock-113.pdf', '9d2745deb0f64c9c5b2e6e538b1668d19f8f31ddfe710fcdaf3cb64e310c91d5', 1, '[{"hash":"9d2745deb0f64c9c5b2e6e538b1668d19f8f31ddfe710fcdaf3cb64e310c91d5","version":1,"updated_at":"2026-09-20T06:37:31.262Z"}]', '7.95', 39, 'http://localhost:3000/previews/preview-036.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-20 06:37:41.827893', null, 22, 6, 1, 1, null, '2026-09-20 06:37:31.23026', '2026-10-02 06:50:00.141455', false, null, false, null, null, ARRAY['Midterm']), (133, 'Trojan Horse for Your Midterm Exam Prep', '- ใส่รหัส **`FC_AJ_OHM`** ลดราคา 20% สำหรับ Cheat Sheet นี้
- **ไม่สามารถนำเข้าห้องสอบได้ เนื่องจากเป็น Closed Book** เป้าหมายในการทำเพื่อที่จะทบทวน
- **แถมคลิปเล่าเรื่องราวทั้งหมด ตั้งแต่ Lecture 1-7** (ปล่อยภายในคืน Sep 22 ก่อนสอบ)

รวมเนื้อหาทั้งหมด 7 บทหลัก ๆ
1. Lecture 1 - Introduction to Cyber Crime 📽️
2. Lecture 2 - MiTB Attack and Trojan Horse 📽️
3. Lecture 3 - Computer Forensics 📽️
4. Lecture 4 - Data Acquisition 📽️
5. Lecture 4.5 - Bloom filter 📽️
6. Lecture 5 - Performing RAID Data Acquisitions 📽️
7. Lecture 5.25 - Cuckoo Filter 📽️
8. Lecture 5.5 - DNSSEC 📽️
9. Lecture 6 - Bitcoin and Blockchain Technology 📽️
10. ~~Lecture 7 - Ethereum and Smart Contract~~ ยกเลิกการทำคลิป555 เหนื่อยละ เดี๋ยวแปะคลิปจำนวนมหาศาลให้ดูแทนละกัน', 'CSS453', '1', '2026', 'Year 4', 'Midterm', '220.00', 'cheatsheets/mock-114.pdf', '6cc0ffa692802e21ce10e9bd24719063f95d668b0ebbf7f31797949543b732c5', 2, '[{"hash":"c5c6748c23aec4336571392b20596a3eebd57569e04e0ce0c4c406f20129a683","version":1,"updated_at":"2026-09-20T07:43:28.598Z"},{"hash":"6cc0ffa692802e21ce10e9bd24719063f95d668b0ebbf7f31797949543b732c5","version":2,"updated_at":"2026-09-21T07:26:43.487Z"}]', '87.09', 8, 'http://localhost:3000/previews/preview-024.jpg', null, '["https://youtu.be/MOCK0000077","https://youtu.be/MOCK0000078","https://youtu.be/MOCK0000079","https://youtu.be/MOCK0000080","https://youtu.be/MOCK0000081","https://youtu.be/MOCK0000082","https://youtu.be/MOCK0000083","https://youtu.be/MOCK0000084","https://youtu.be/MOCK0000085","https://youtu.be/MOCK0000086","https://youtu.be/MOCK0000087","https://youtu.be/MOCK0000088","https://youtu.be/MOCK0000089","https://youtu.be/MOCK0000090","https://youtu.be/MOCK0000091","https://youtu.be/MOCK0000092","https://youtu.be/MOCK0000093"]', '- POW: trust in math
- POS: trust in rich people 5555', true, false, null, 'approved', 1, '2026-09-20 07:43:52.233069', null, 64, 5, 1, 1, '2026-09-21 06:00:00', '2026-09-20 07:43:28.606714', '2026-10-11 09:31:10.391822', false, null, false, null, null, ARRAY['Midterm']), (134, 'DES424 - Cloud-based AppDev Midterm (AI Slop Edition)', '# DES424 Cloud-based Application Development — Midterm Cheat Sheet

Two A4 pages, three columns, 6pt Helvetica. Built from the six lecture decks and
the three homework briefs, condensed into something you can read in one sitting
the night before.

## What you get

**Lectures 1–6, the parts that get examined.** Software engineering and the three
requirement types; cloud computing (business drivers, the five NIST
characteristics, IaaS/PaaS/SaaS, deployment models, scaling); global
infrastructure and cloud application design; infrastructure and virtualisation
(hypervisor types, VM vs container, Proxmox, JIRA); storage (ephemeral vs
persistent, block/file/object, S3, RDS, DynamoDB, SQS); and networking (CIDR,
VPC, subnets, NAT, security groups vs NACLs, Route 53 routing policies).

**Six diagrams** drawn for intuition rather than decoration: Region/AZ/VPC/subnet
scoping, Type-1 vs Type-2 vs container stacks, block vs file vs object storage,
security group vs network ACL boundaries, a use-case/class/activity trio, and a
full multi-AZ highly-available AWS architecture using the official AWS
Architecture Icons.

**A worked design example** — a café online-ordering system with five
requirements, split into functional requirements, non-functional requirements and
constraints with the reasoning shown, then modelled as three UML diagrams, then
turned into an AWS architecture, then a marking checklist that ties every box in
the diagram back to a specific requirement.

**Homework HW1–HW3** summarised as *what each lab was actually proving*, including
the `mysqldump` / `mysql` commands from the RDS migration lab.

**Colour-coded callouts throughout** — green tips, red traps, orange exam notes —
for the things that are easy to get backwards: VPC spans AZs but a subnet does
not, NAT gateways are per-AZ, Multi-AZ is availability and read replicas are
performance, geolocation is the user and geoproximity is your resources, and so
on.

---

## What it does not cover

**Detail that was cut to fit two pages.** The page budget is hard, and the
following were trimmed or dropped: the RAD §3.3 non-functional requirement
sub-checklist, server hardware specifics, provider histories and Azure-specific
features, EMR job types, Elastic Transcoder / SES / SNS detail, the Proxmox and
JIRA click-through walkthroughs, exact EBS IOPS figures, and anything to do with
pricing.

**Three UML diagram types are named but not drawn** — sequence, statechart, and
deployment/component. You get the rule for *when* to use each, not a worked
example of them.

**The internet gateway is absent from the architecture diagram.** It was removed
deliberately, so the picture does not show how traffic physically enters the VPC.
The route-table rule (`0.0.0.0/0 → igw` is what makes a subnet public) is still in
the text, but the diagram will not remind you of it.

**The worked example is invented.** The café scenario is modelled on the AWS
Academy labs, not taken from a past paper. The architecture is built around a
question the lecturer was reported to have flagged as exam material — that is
second-hand, and no part of this sheet is a leaked or official answer key.

---

## Disclaimer

**Use at your own risk.** This is one student''s condensed reading of the slides.
If anything in this sheet and the lecture slides disagree, **the slides are right and this is wrong** "Check anything that matters before you rely on it."

**No guarantee of accuracy, completeness, or exam coverage.** Topics were selected
by judgement about what tends to be examined. That judgement may be wrong. A
topic being absent here is not evidence it is absent from the exam.

**No refunds.** No warranty, express or implied. If you fail, that is between you and the exam.

**Trademarks.** The AWS Architecture Icons are the property of Amazon Web
Services and are used here under their icon-set terms for architecture diagrams.
This is not an AWS publication and is not affiliated with or endorsed by Amazon.

---', 'DES424', '1', '2026', 'Year 4', 'Midterm', '167.00', 'cheatsheets/mock-115.pdf', '3bc4a249289068157de241b485167cc3dd549ab1f3c14d9739de9634728425aa', 1, '[{"hash":"3bc4a249289068157de241b485167cc3dd549ab1f3c14d9739de9634728425aa","version":1,"updated_at":"2026-09-20T13:19:00.472Z"}]', '0.27', 2, 'http://localhost:3000/previews/preview-030.jpg', null, null, '⚠️ Found a Serious Mistake?

If you find any serious mistake or error in the cheatsheet, please report it to me at 6622782207@g.siit.tu.ac.th. I will do my best to review and address reported issues. Please note that I will only be able to respond to emails received by 10:00 P.M. on 21 September 2026. 

🎁 Free Advice!

If you have any questions or need clarification about the lecture or cheatsheet, feel free to email me. I’ll do my best to explain it and help you understand the material.

For questions that are not related to reporting an error, please send your email before 6:00 P.M. on 21 September 2026 so that I have enough time to reply.', true, false, null, 'approved', 1, '2026-09-20 13:19:27.102161', null, 28, 0, 16, 1, null, '2026-09-20 13:19:00.427929', '2026-09-30 11:12:47.523902', false, null, false, null, null, ARRAY['Midterm']), (135, 'Cloud Midterm !!TMI warning', '## Cloud Midterm Cheatsheet - cover all chapters (1-6)
- รับรองว่าครบ ไล่ทุกหน้า เรียงตาม slide เลย เนื้อหาแน่นมากกก
- มี sample question ที่อจ guide (func/nonfunc requirements + class diagram + usecase diagram + sequence diagram + system architecture diagram)
- color coded: content, keywords, topics, AWS/tech components', 'DES424', '1', '2026', 'Year 4', 'Midterm', '149.00', 'cheatsheets/mock-116.pdf', 'd235165b30eb45bd8c85425bef933be34d70e323383a130e2ce6293c1bdd60f5', 1, '[{"hash":"d235165b30eb45bd8c85425bef933be34d70e323383a130e2ce6293c1bdd60f5","version":1,"updated_at":"2026-09-20T16:47:35.708Z"}]', '3.45', 2, 'http://localhost:3000/previews/preview-031.jpg', null, null, 'color code

- orange - topics/ concepts
- violet - keyword/ buzz words
- green - AWS/ tech components
- dark blue - exercise', true, false, null, 'approved', 1, '2026-09-20 16:47:47.052354', null, 117, 13, 411, 1, null, '2026-09-20 16:47:35.709621', '2026-10-04 16:07:29.642974', false, null, false, null, null, ARRAY['Midterm']), (136, 'Scientific Computing - Last Breath', '**Scientific Computing - Midterm Open-book**
- Taught by **Dr. Watthanasak**
- Contains weeks 1-7: definitions, exercises, formulas, important keys
- Free!! **Practice exams** for all weeks, with answer keys

**AI was used in the making of this summary**', 'CSS322', '1', '2026', 'Year 3', 'Midterm', '169.00', 'cheatsheets/mock-117.pdf', '7987a6d9ab4a439309fc3c3c99a0c28d39d4424490ea3b4e77bb882c9a96877a', 1, '[{"hash":"7987a6d9ab4a439309fc3c3c99a0c28d39d4424490ea3b4e77bb882c9a96877a","version":1,"updated_at":"2026-09-21T12:34:38.259Z"}]', '0.54', 53, 'http://localhost:3000/previews/preview-018.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-21 12:35:19.035859', null, 59, 0, 229, 1, null, '2026-09-21 12:34:38.288943', '2026-09-26 14:27:34.663769', false, null, false, null, null, ARRAY['Midterm']), (137, 'Ethical Hacking Midterm', 'hacking ไงจ๊ะ', 'CSS484', '1', '2026', 'Year 4', 'Midterm', '106.56', 'cheatsheets/mock-118.pdf', '11b1c710af83cd040731b12facf5ed3e13cd4c9fb66229baab47523361881f1a', 1, '[{"hash":"11b1c710af83cd040731b12facf5ed3e13cd4c9fb66229baab47523361881f1a","version":1,"updated_at":"2026-09-21T18:17:50.782Z"}]', '26.95', 2, 'http://localhost:3000/previews/preview-026.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-21 18:18:59.594393', null, 35, 0, 2, 1, null, '2026-09-21 18:17:50.760536', '2026-09-30 10:15:13.343694', false, null, false, null, null, ARRAY['Midterm']), (138, 'Midterm Summary for DES331!!!', '**DES331 Summary and Practice Exams!!**
- Taught by **Aj.Nuntanut**
- Contains summary of week 1 - 5: Intro, Application Layer, Transport Layer
- **Free!!** 2 Sets of Practice Exams', 'DES331', '1', '2026', 'Year 3', 'Midterm', '99.00', 'cheatsheets/mock-119.pdf', 'd9bf7363049b7dc2643185f909611a8bd4594a184a7253097573da87896d730e', 2, '[{"hash":"e8359db77520c5295f977b67456202ecb9361df5bb5b7089bb44f3ad7063e2cb","version":1,"updated_at":"2026-09-23T06:36:15.789Z"},{"hash":"d9bf7363049b7dc2643185f909611a8bd4594a184a7253097573da87896d730e","version":2,"updated_at":"2026-09-23T09:11:04.034Z"}]', '2.95', 37, 'http://localhost:3000/previews/preview-029.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-23 06:55:31.260154', null, 117, 28, 136, 1, null, '2026-09-23 06:36:15.75243', '2026-10-08 23:02:51.260786', false, null, false, null, null, ARRAY['Midterm']), (139, 'CSS331 Fundamentals of Data Communications Midterm', '2 pages hand-written cheatsheet Aj.Sasiporn', 'CSS331', '1', null, 'Year 3', 'Midterm', '40.00', 'cheatsheets/mock-120.pdf', 'b3c3c9c6cb4714cda54106b945c02627ad4bacb20a368446f5f517c4cd1f7ad4', 1, '[{"hash":"b3c3c9c6cb4714cda54106b945c02627ad4bacb20a368446f5f517c4cd1f7ad4","version":1,"updated_at":"2026-09-23T17:38:26.653Z"}]', '17.85', 2, 'http://localhost:3000/previews/preview-021.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-23 17:38:56.424105', null, 14, 0, 44, 1, null, '2026-09-23 17:38:26.697354', '2026-09-28 09:21:59.214637', false, null, false, null, null, ARRAY['Midterm']), (140, 'CSS452 Internet of Things Midterm', 'By August(Singha) และแรงงานทาส Mo(Pawit)
2 Pages Cheatsheet Aj. Seksan', 'CSS452', '1', '2026', 'Year 4', 'Midterm', '67.00', 'cheatsheets/mock-121.pdf', 'e607b79a01bfc4a4f488224b0ae94bc869a1e7f47d74e22b5e948b530f229e2b', 1, '[{"hash":"e607b79a01bfc4a4f488224b0ae94bc869a1e7f47d74e22b5e948b530f229e2b","version":1,"updated_at":"2026-09-23T17:52:20.772Z"}]', '0.93', 2, 'http://localhost:3000/previews/preview-023.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-23 17:52:45.477421', null, 20, 1, 44, 1, null, '2026-09-23 17:52:20.722204', '2026-10-12 10:10:49.557635', false, null, false, null, null, ARRAY['Midterm']), (141, 'Software Project Development', 'Read more real example in the slides for more understanding.
80 Points -> 20%

---
Part 1 Multiple Choices (55 Questions)
- Chapter 1 Introduction to Software Development (15)
- Chapter 2 Software Project Management (15)
- Chapter 3 Project Initiation (20)
- Chapter 4 SDLC (5)
---
Part 2 Short explaination (2 Questions)
- Q1: SWOT Analysis (10 Points)
- Q2: Create Project Chater (15 Points)', '1501315', '1', '2026', 'Year 3', 'Midterm', '29.00', 'cheatsheets/mock-122.pdf', '6c331c78717db7738bc371300d651cb36257e4fd05858430cd5762dc22559cf9', 2, '[{"hash":"643f4cda3be54fc5c8b7218d9f76e483d9ce09c2b8dad7a65b25f060b9053f31","version":1,"updated_at":"2026-09-24T16:07:42.473Z"},{"hash":"6c331c78717db7738bc371300d651cb36257e4fd05858430cd5762dc22559cf9","version":2,"updated_at":"2026-09-30T05:45:19.360Z"}]', '14.14', 3, 'http://localhost:3000/previews/preview-007.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-24 16:09:47.907778', null, 61, 7, 335, 2, '2026-09-25 02:41:00', '2026-09-24 16:07:42.494964', '2026-10-02 16:50:56.429972', false, null, false, null, null, ARRAY['Midterm']), (142, 'DES431 Big Data Analytics and Machine Learning Midterm', 'by Toon(Pachara), August(Singha), และแรงงานทาส Mo(Pawit)

**เนื้อหา:**
- L1 Introduction
- L2 Data and Data Management
- L3 Data and Data Management II
- L4 Data Preprocessing
- L5 Big Data Framework
- L6 MapReduce Framework and Programming
- AWS EMR + RapidMiner

จริงๆอยากขายแพงกว่านี้แต่มันไม่มีม ิิ', 'DES431', '1', '2026', 'Year 4', 'Midterm', '67.69', 'cheatsheets/mock-123.pdf', '6a33519dcd9cffbb1576d8c52021296308944d3f08660ed6c2be5aca23fbc9ff', 1, '[{"hash":"6a33519dcd9cffbb1576d8c52021296308944d3f08660ed6c2be5aca23fbc9ff","version":1,"updated_at":"2026-09-24T20:39:56.536Z"}]', '2.94', 2, 'http://localhost:3000/previews/preview-033.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-25 00:21:56.408058', null, 15, 0, 44, 1, null, '2026-09-24 20:39:56.537153', '2026-10-08 04:06:21.259193', false, null, false, null, null, ARRAY['Midterm']), (143, 'SMA (Sciences & Mathematics All Around)', 'All you need to know about SMA
- Body Systems
- Foods & Nutritions
- Chemical & Cosmetics
- Materials World
- Electricity & Energy
- Blue Planet
- Geography
- Global Warming
- Astronomy', '1101105', null, null, null, 'Midterm', '99.00', 'cheatsheets/mock-124.pdf', '6dd7b45684c5f0e354ff60aa12ed083ba6bcbd7d29c3b22c71451474346d3397', 1, '[{"hash":"6dd7b45684c5f0e354ff60aa12ed083ba6bcbd7d29c3b22c71451474346d3397","version":1,"updated_at":"2026-09-26T02:52:59.059Z"}]', '15.21', 24, 'http://localhost:3000/previews/preview-001.jpg', null, null, 'Review every questions from the quiz, they might be in the real exam. (look carefully ;-) )
อาจารย์เอาควิซมาออกเลย แนวคิดเดียวกัน แต่ระวังโดนหลอกก', true, false, null, 'approved', 1, '2026-09-26 04:14:37.216314', null, 7, 0, 335, 2, null, '2026-09-26 02:52:59.012465', '2026-09-29 08:19:27.324832', false, null, false, null, null, ARRAY['Midterm','Final']), (144, 'Computer Programming', 'All about Computer Programming C#
- Data Types
- Operators
- Control Statements
- Nested-If
- Loop
- Nested-Loop
- Types of Method
- Array', '1501116', null, null, 'Year 1', 'Midterm', '99.00', 'cheatsheets/mock-125.pdf', 'eb1f40824a10779307ceb5fc73fbaf0055c5d9e916a95fe71f23c53ad8dd86bd', 1, '[{"hash":"eb1f40824a10779307ceb5fc73fbaf0055c5d9e916a95fe71f23c53ad8dd86bd","version":1,"updated_at":"2026-09-26T03:04:05.103Z"}]', '28.87', 13, 'http://localhost:3000/previews/preview-002.jpg', null, null, 'If you have done all the labs by yourself, you can do the exam', true, false, null, 'approved', 1, '2026-09-26 04:14:35.796578', null, 4, 0, 335, 2, null, '2026-09-26 03:04:05.055038', '2026-09-30 15:32:22.140106', false, null, false, null, null, ARRAY['Midterm','Final']), (145, 'Introduction to Data Science', 'All about data sci
- Data Science Processes
- EDA
- Centrality of Data
- Imputation
- Features & Attributes
- Univariable Analysis
- Bivariate Analysis
- Handling: Outliers, Missing Values, Inconsistencies, Mixed-Type Data
- Feature Scaling: Normalization, Standardization
- Data Resampling & Partitioning
- ML vs Deep Learning
- Data Sci Ethics & AI', '1501430', null, null, 'Year 2', 'Midterm', '99.00', 'cheatsheets/mock-126.pdf', '3284117cb8931623a250a2299c9052f2aee32da680b9864cc7cc7dfe64b12e40', 1, '[{"hash":"3284117cb8931623a250a2299c9052f2aee32da680b9864cc7cc7dfe64b12e40","version":1,"updated_at":"2026-09-26T03:20:36.202Z"}]', '37.74', 12, 'http://localhost:3000/previews/preview-009.jpg', null, null, 'Review all the exercises in the slides for better understanding', true, false, null, 'approved', 1, '2026-09-26 04:14:34.094497', null, 9, 0, 335, 2, null, '2026-09-26 03:20:36.197971', '2026-09-30 07:43:16.533328', false, null, false, null, null, ARRAY['Midterm','Final']), (146, 'Math 2 One Page', 'High school knowledge, but a little more intense
- Matrix & Linear Equation
- Set
- Logical & Boolean
- Probability & Combinatorics
- Sequences & Series
- Convergent & Divergent
- Graph Theory', '1501206', null, null, 'Year 2', 'Midterm', '20.00', 'cheatsheets/mock-127.pdf', 'cd1b1466a55bf0b8b20400a9e1bf0f01065b3e811c727ea577fe7022160242c9', 2, '[{"hash":"1fd1e9beb87996829be21ba5e70ca8a910f22c13c0f70d087161f0353da44fce","version":1,"updated_at":"2026-09-26T03:42:54.665Z"},{"hash":"cd1b1466a55bf0b8b20400a9e1bf0f01065b3e811c727ea577fe7022160242c9","notes":"Fix the typo in the formula","version":2,"updated_at":"2026-10-02T08:19:06.254Z"}]', '29.19', 1, 'http://localhost:3000/previews/preview-003.jpg', null, null, 'Practice all the exercises in the slides, even though it''s frustrating. 
Practice makes perfect.', true, false, null, 'approved', 1, '2026-09-26 04:14:30.281232', null, 5, 0, 335, 2, null, '2026-09-26 03:42:54.669749', '2026-10-02 08:19:06.259561', false, null, false, null, null, ARRAY['Midterm','Final']), (147, 'Database Systems', 'This course is a bit challenging (may have a written exam: ER-Diagram to Relational Mapping Algorithms)
- DBMS
- Entity-Relationship
- Data Modelling
- ER-Diagram Notations
- Keys: Candidate, Primary, Foreign
- Cardinality Ratio
- Rational DB
- SQL Operations', '1501208', null, null, 'Year 2', 'Midterm', '99.00', 'cheatsheets/mock-128.pdf', '7f76b8648856a1b58b2717e031aecc9d130b24b4c58e1e18f9a81c00be7afbb5', 1, '[{"hash":"7f76b8648856a1b58b2717e031aecc9d130b24b4c58e1e18f9a81c00be7afbb5","version":1,"updated_at":"2026-09-26T03:53:46.272Z"}]', '64.48', 28, 'http://localhost:3000/previews/preview-004.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-26 04:14:28.804925', null, 10, 0, 335, 2, null, '2026-09-26 03:53:46.276025', '2026-10-12 11:15:54.43277', false, null, false, null, null, ARRAY['Midterm','Final']), (148, 'Fundamentals of Digital Logic & Microcontrollers (Really Fun 🤡)', 'The knowledge in the Lab class is essential
- Analog & Digital
- Pulses, Clock, Timing Diagram
- Data Transfer: Serial, Parallel
- Logic Gates
- Number Systems: Decimal, Binary, Hex, Oct
- Arithmetic
- Grey Code
- Boolean Algebra: SOP, POS
- Kanaugh Map & Truth Table
- Microcontrollers: Arduino & Sensors Input, Output
- UART, $I^2C$, SPI', '1501211', null, null, 'Year 2', 'Midterm', '99.00', 'cheatsheets/mock-129.pdf', '82bc8eece1adc77443055bd6fcd6689d82250f133e615ef7bbf0ea73db3991e4', 1, '[{"hash":"82bc8eece1adc77443055bd6fcd6689d82250f133e615ef7bbf0ea73db3991e4","version":1,"updated_at":"2026-09-26T04:13:15.987Z"}]', '131.70', 25, 'http://localhost:3000/previews/preview-005.jpg', null, null, 'Remember the bit transfer for each serial communication protocals
- UART connection for TX RX
- Master Slave', true, false, null, 'approved', 1, '2026-09-26 04:14:27.312882', null, 14, 0, 335, 2, null, '2026-09-26 04:13:15.992259', '2026-10-05 05:39:46.117292', false, null, false, null, null, ARRAY['Midterm','Final']), (149, 'Data Communication & Networks', 'Remember how to find subnets, it''s very important
- Network communication, components, media, topology
- LAN WAN
- Internet: Intranets, Extranets
- **TCP/IP Protocol Layers**
- **OSI 7 Layers**
- Cable types: Copper, UTP, STP, Coaxial, Fiber Optic
- Wireless Connection
- Data Link Layer, Internet Frame
- MAC Address
- Duplex
**- IPv4, IPv6: Subnets**
- Router with its protocols: RIP, OSPF
- Switch & VLAN', '1501212', null, null, 'Year 2', 'Midterm', '99.00', 'cheatsheets/mock-130.pdf', '7a50ea1ff6bef61aea2473b3ba39efdf40e2ccfc81bb17f0496b652cfdcd7dd7', 1, '[{"hash":"7a50ea1ff6bef61aea2473b3ba39efdf40e2ccfc81bb17f0496b652cfdcd7dd7","version":1,"updated_at":"2026-09-26T04:30:04.746Z"}]', '97.14', 30, 'http://localhost:3000/previews/preview-006.jpg', null, null, 'Straight-Through: connect difference devices
Cross-Over: connect same devices

Remeber how to find subnets, wild card (beware that the first IP in the subnet usually be the Network IP, the last IP is broadcast)', true, false, null, 'approved', 1, '2026-09-26 04:30:30.504359', null, 5, 0, 335, 2, null, '2026-09-26 04:30:04.702076', '2026-09-30 10:04:06.918965', false, null, false, null, null, ARRAY['Midterm','Final']), (150, 'ML อาจารย์ฝนปราบเซียน - Midterm', 'one A4 Cheat Sheet are allowed, but maybe it can''t help that much 💀. Good Luck ☘️
- Introduction to ML
- Data Preprocessing
- Data Partitioning
- Validating: Accuracy, Sensitivity, Specificity, Precision, G-mean, F1-score
- Logistic Regression
- Gradient Descent
- Naïve Bayes
- kNN
- SVM', '1501412', null, null, 'Year 3', 'Midterm', '69.00', 'cheatsheets/mock-131.pdf', '8d5bf205001e512802b11b9decd59b5277276376ea7bcfd4ef456a7d6fca9fb6', 2, '[{"hash":"dee8a6f2a332f54d471518948165a7e817dfe9f6cfba99659175e9b40e316417","version":1,"updated_at":"2026-09-26T04:56:41.683Z"},{"hash":"8d5bf205001e512802b11b9decd59b5277276376ea7bcfd4ef456a7d6fca9fb6","version":2,"updated_at":"2026-10-01T13:06:01.516Z"}]', '18.24', 5, 'http://localhost:3000/previews/preview-008.jpg', null, null, 'Mock https://example.com/drive-file

1. ลองฝึกทำทุก Exercise ให้ครบทุกอันครับบ

2. จำให้ดี Features, Attributes, Columns, Fields คืออย่างเดียวกัน, 
Instances, Records, Rows, Sample, Observations คืออย่างเดียวกัน

3. ข้อดี-ข้อเสียของแต่ละ Algorithms (Pros & Cons)

4. มีวิเคราะห์ว่าข้อไหนเป็น TP TN FP FN

5. มีให้เลือกค่า Gamma γ ว่าแบบไหนเหมาะสม', true, false, null, 'approved', 1, '2026-09-26 04:57:08.66657', null, 56, 4, 335, 2, null, '2026-09-26 04:56:41.634296', '2026-10-11 06:50:59.731879', false, null, false, null, null, ARRAY['Midterm']), (151, 'Chinese 2', 'ศัพท์ทั้งหมดในจีน 2 พร้อมคำอ่าน พินอิน และคำแปล + ไวยากรณ์
- งานอดิเรก
- ความสามารถ
- สภาพอากาศ
- อาชีพ
- อาหาร + รสชาติ
- สกุลเงินต่าง ๆ 
- บอกสถานที่ ทิศ
- อาการเจ็บป่วย
- สถานที่ท่องเที่ยวยอดฮิต
- ศัพท์ในสนามบิน', '2408102', '2', null, 'Year 1', 'Midterm', '69.00', 'cheatsheets/mock-132.pdf', 'e119a1ec866569b3e6c7f9c641ce98ddfb48a91bd0ea17850c0d82344cbe7642', 1, '[{"hash":"e119a1ec866569b3e6c7f9c641ce98ddfb48a91bd0ea17850c0d82344cbe7642","version":1,"updated_at":"2026-09-26T05:57:34.252Z"}]', '47.77', 11, 'http://localhost:3000/previews/preview-010.jpg', null, null, 'Oral Test 1 & 2 Question Pool
https://example.com/drive-file', true, false, null, 'approved', 1, '2026-09-26 05:58:05.458018', null, 9, 0, 335, 2, null, '2026-09-26 05:57:34.260556', '2026-10-08 19:38:35.225557', false, null, false, null, null, ARRAY['Midterm','Final']), (152, 'Database Final: One A4 to Rule Them All', '## Database Final: One A4 to Rule Them All
>เรียนกับอาจารย์ Preecha Tangworakitthaworn
- ถ้าจำไม่ผิดคือ Final เหมือนจะ **Open Book** แต่ว่า อยากทำสรุปแบบไม่ต้องพลิกไปมาเยอะ เพราะเดี๋ยวเวลาจะเสียไป ก็เลยทำสรุปแบบ 1 A4 ดู -> ก็สามารถช่วยได้มากจริง ๆ ครบเครื่องทุกอย่างในนี้
- สรุปเป็น**ภาษาไทย** อ่านแล้วเข้าใจเลยทันที เช่นพวกขั้นตอนการหา Superkey, Candidate Key, Primary Key

รวบรวม Lecture ทั้งหมดของ Final
1. Lecture 8 - Keys and FDs
2. Lecture 9 - Normalization
3. Lecture 10 - Structural Query Language
4. Lecture 11 - SQL DQL (Data Query Language)
5. Lecture 12 - Advanced QL, Set Operators, Correlated and Nested Sub Query
6. Lecture 13 - SQL: View, Store Procedure, and Trigger
7. Lecture 14 - Transactions and Concurrency Control', 'CSS325', '1', '2025', 'Year 3', 'Final', '59.00', 'cheatsheets/mock-133.pdf', 'b395d5b3fdcf30e8ab4bb979aa31bea7bb254a612cc68de93427786247125a31', 1, '[{"hash":"b395d5b3fdcf30e8ab4bb979aa31bea7bb254a612cc68de93427786247125a31","version":1,"updated_at":"2026-09-27T15:36:44.052Z"}]', '12.30', 2, 'http://localhost:3000/previews/preview-019.jpg', null, null, null, true, false, null, 'approved', 1, '2026-09-27 15:37:20.620021', null, 5, 0, 1, 1, null, '2026-09-27 15:36:44.025789', '2026-10-12 11:18:18.903427', false, null, false, 'http://localhost:3000/previews/preview-012.jpg', 'http://localhost:3000/previews/preview-011.jpg', ARRAY['Final']), (153, 'Database Final Cheat Sheet', 'Database Systems taught by Dr. Preecha - **Open book exam** contains lecture notes after the midterm, including in-class exercises', 'CSS325', '1', '2025', 'Year 3', 'Final', '50.00', 'cheatsheets/mock-134.pdf', '714d17e97fcc1f43624d940bd3060c371f17812d992c663dbe2d37e428807d5b', 1, '[{"hash":"714d17e97fcc1f43624d940bd3060c371f17812d992c663dbe2d37e428807d5b","version":1,"updated_at":"2026-10-11T02:23:08.408Z"}]', '75.66', 24, 'http://localhost:3000/previews/preview-020.jpg', null, null, null, true, false, null, 'approved', 1, '2026-10-11 02:24:20.029347', null, 8, 0, 17, 1, null, '2026-10-11 02:23:08.459872', '2026-10-13 04:43:40.869743', false, null, false, null, null, ARRAY['Final']);
-- Keep the SERIAL sequence ahead of the explicit ids we just inserted.
SELECT setval(pg_get_serial_sequence('cheat_sheets','cheatsheet_id'), (SELECT MAX(cheatsheet_id) FROM cheat_sheets));
