const { exec } = require('./connection');

const initSchema = () => {
    const schemaSql = `
    -- System Roles & Permissions
    CREATE TABLE IF NOT EXISTS Role (
      role_id VARCHAR(36) PRIMARY KEY,
      role_name VARCHAR(50) UNIQUE NOT NULL,
      description VARCHAR(255),
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      status INT DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS User (
      user_id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      role_id VARCHAR(36) NOT NULL,
      department_id VARCHAR(36),
      avatar_url VARCHAR(255),
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      status INT DEFAULT 1,
      FOREIGN KEY (role_id) REFERENCES Role(role_id),
      FOREIGN KEY (department_id) REFERENCES Department(department_id)
    );

    -- 1. Table Department
    CREATE TABLE IF NOT EXISTS Department (
      department_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      department_code VARCHAR(20) UNIQUE NOT NULL,
      department_name VARCHAR(100) NOT NULL,
      description VARCHAR(255),
      manager_id VARCHAR(36),
      parent_department_id VARCHAR(36),
      target_headcount INT DEFAULT 0,
      status INT DEFAULT 1
    );

    -- 2. Table Position
    CREATE TABLE IF NOT EXISTS Position (
      position_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      position_code VARCHAR(20) UNIQUE NOT NULL,
      position_name VARCHAR(100) NOT NULL,
      department_id VARCHAR(36),
      description VARCHAR(255),
      target_headcount INT DEFAULT 0,
      status INT DEFAULT 1,
      FOREIGN KEY (department_id) REFERENCES Department(department_id) ON DELETE SET NULL
    );

    -- 3. Table Employee
    CREATE TABLE IF NOT EXISTS Employee (
      employee_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      employee_code VARCHAR(20) UNIQUE NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      gender VARCHAR(10),
      date_of_birth BIGINT,
      citizen_id VARCHAR(20),
      citizen_issue_date BIGINT,
      citizen_issue_place VARCHAR(100),
      phone VARCHAR(20),
      email VARCHAR(100),
      address VARCHAR(255),
      permanent_address VARCHAR(255),
      department_id VARCHAR(36),
      position_id VARCHAR(36),
      manager_id VARCHAR(36),
      level VARCHAR(50) DEFAULT 'Nhân viên',
      join_date BIGINT,
      official_date BIGINT,
      employment_status VARCHAR(30) DEFAULT 'WORKING',
      avatar_url VARCHAR(255),
      note VARCHAR(255),
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (department_id) REFERENCES Department(department_id),
      FOREIGN KEY (position_id) REFERENCES Position(position_id),
      FOREIGN KEY (manager_id) REFERENCES Employee(employee_id)
    );

    -- 4. Table EmployeeContract
    CREATE TABLE IF NOT EXISTS EmployeeContract (
      contract_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      contract_no VARCHAR(50) UNIQUE NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      contract_type VARCHAR(50) NOT NULL,
      sign_date BIGINT,
      start_date BIGINT,
      end_date BIGINT,
      salary DECIMAL NOT NULL,
      status VARCHAR(30) DEFAULT 'ACTIVE',
      attachment_url VARCHAR(255),
      note VARCHAR(255),
      FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
    );

    -- 5. Table WorkHistory
    CREATE TABLE IF NOT EXISTS WorkHistory (
      work_history_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      department_id VARCHAR(36),
      position_id VARCHAR(36),
      decision_type VARCHAR(50) NOT NULL,
      effective_date BIGINT,
      reason VARCHAR(255),
      note VARCHAR(255),
      FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE,
      FOREIGN KEY (department_id) REFERENCES Department(department_id),
      FOREIGN KEY (position_id) REFERENCES Position(position_id)
    );

    -- 6. Table RewardDiscipline
    CREATE TABLE IF NOT EXISTS RewardDiscipline (
      reward_discipline_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      decision_no VARCHAR(50) UNIQUE NOT NULL,
      decision_type VARCHAR(20) NOT NULL,
      decision_date BIGINT,
      effective_date BIGINT,
      reason VARCHAR(255),
      content VARCHAR(500),
      decision_by VARCHAR(100),
      attachment_url VARCHAR(255),
      FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
    );

    -- 7. Table RecruitmentRequest
    CREATE TABLE IF NOT EXISTS RecruitmentRequest (
      recruitment_request_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      request_code VARCHAR(30) UNIQUE NOT NULL,
      department_id VARCHAR(36) NOT NULL,
      position_id VARCHAR(36) NOT NULL,
      requested_by VARCHAR(36),
      quantity INT NOT NULL,
      reason VARCHAR(255),
      expected_date BIGINT,
      priority VARCHAR(20) DEFAULT 'MEDIUM',
      status VARCHAR(30) DEFAULT 'PENDING',
      is_outside_headcount INT DEFAULT 0,
      note VARCHAR(255),
      FOREIGN KEY (department_id) REFERENCES Department(department_id),
      FOREIGN KEY (position_id) REFERENCES Position(position_id),
      FOREIGN KEY (requested_by) REFERENCES Employee(employee_id)
    );

    -- 8. Table RecruitmentPlan
    CREATE TABLE IF NOT EXISTS RecruitmentPlan (
      recruitment_plan_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      recruitment_request_id VARCHAR(36) NOT NULL,
      plan_name VARCHAR(100) NOT NULL,
      start_date BIGINT,
      end_date BIGINT,
      budget DECIMAL DEFAULT 0,
      status VARCHAR(30) DEFAULT 'IN_PROGRESS',
      note VARCHAR(255),
      FOREIGN KEY (recruitment_request_id) REFERENCES RecruitmentRequest(recruitment_request_id) ON DELETE CASCADE
    );

    -- 9. Table RecruitmentRound
    CREATE TABLE IF NOT EXISTS RecruitmentRound (
      recruitment_round_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      recruitment_plan_id VARCHAR(36) NOT NULL,
      round_name VARCHAR(100) NOT NULL,
      round_order INT DEFAULT 1,
      description VARCHAR(255),
      status VARCHAR(30) DEFAULT 'ACTIVE',
      FOREIGN KEY (recruitment_plan_id) REFERENCES RecruitmentPlan(recruitment_plan_id) ON DELETE CASCADE
    );

    -- 10. Table Candidate (Bổ sung thêm các trường BRAVO ERP từ Ảnh 2)
    CREATE TABLE IF NOT EXISTS Candidate (
      candidate_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      candidate_code VARCHAR(20) UNIQUE NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      gender VARCHAR(10),
      date_of_birth BIGINT,
      citizen_id VARCHAR(20),
      phone VARCHAR(20),
      email VARCHAR(100),
      address VARCHAR(255),
      culture_level VARCHAR(50) DEFAULT '12/12',
      education_level VARCHAR(100),
      education_school VARCHAR(150),
      major VARCHAR(100),
      skill_level VARCHAR(50),
      experience VARCHAR(255),
      recruitment_plan_id VARCHAR(36) NOT NULL,
      source VARCHAR(100),
      recruitment_unit VARCHAR(100),
      referrer VARCHAR(100),
      cv_url VARCHAR(255),
      received_date BIGINT,
      eval_date BIGINT,
      status VARCHAR(30) DEFAULT 'SUBMITTED',
      rejection_reason VARCHAR(255),
      note VARCHAR(255),
      FOREIGN KEY (recruitment_plan_id) REFERENCES RecruitmentPlan(recruitment_plan_id)
    );

    -- 11B. Table DepartmentQuota (Phiếu Định Biên Nhân Sự)
    CREATE TABLE IF NOT EXISTS DepartmentQuota (
      quota_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      quota_code VARCHAR(50) UNIQUE NOT NULL,
      effective_date BIGINT NOT NULL,
      department_id VARCHAR(36) NOT NULL,
      creator_id VARCHAR(36),
      creator_name VARCHAR(100),
      target_headcount INT DEFAULT 0,
      max_capacity INT DEFAULT 0,
      current_headcount INT DEFAULT 0,
      budget DECIMAL DEFAULT 0,
      description VARCHAR(500),
      status VARCHAR(30) DEFAULT 'Tạo phiếu',
      FOREIGN KEY (department_id) REFERENCES Department(department_id)
    );

    -- 11C. Table DepartmentQuotaDetail (Chi tiết Định biên Nhân sự theo Vị trí)
    CREATE TABLE IF NOT EXISTS DepartmentQuotaDetail (
      detail_id VARCHAR(36) PRIMARY KEY,
      quota_id VARCHAR(36) NOT NULL,
      position_id VARCHAR(36),
      position_code VARCHAR(50),
      position_name VARCHAR(100),
      target_headcount INT DEFAULT 0,
      resignation_count INT DEFAULT 0,
      maternity_count INT DEFAULT 0,
      current_headcount INT DEFAULT 0,
      needed_headcount INT DEFAULT 0,
      note VARCHAR(255),
      FOREIGN KEY (quota_id) REFERENCES DepartmentQuota(quota_id) ON DELETE CASCADE
    );

    -- 11C2. Table Interview (Kết quả/điểm chấm phỏng vấn ứng viên)
    CREATE TABLE IF NOT EXISTS Interview (
      interview_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      candidate_id VARCHAR(36) NOT NULL,
      recruitment_round_id VARCHAR(36) NOT NULL,
      interviewer_id VARCHAR(36),
      interview_date BIGINT,
      score DECIMAL,
      result VARCHAR(30),
      comment VARCHAR(500),
      FOREIGN KEY (candidate_id) REFERENCES Candidate(candidate_id),
      FOREIGN KEY (recruitment_round_id) REFERENCES RecruitmentRound(recruitment_round_id)
    );

    -- 11D. Table InterviewSchedule (Lịch phỏng vấn - thi tuyển)
    CREATE TABLE IF NOT EXISTS InterviewSchedule (
      schedule_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      schedule_code VARCHAR(50) UNIQUE NOT NULL,
      round_type VARCHAR(50) NOT NULL,
      format_type VARCHAR(50) NOT NULL,
      location VARCHAR(255),
      start_time BIGINT,
      end_time BIGINT,
      note TEXT,
      candidate_note TEXT,
      candidates_json TEXT,
      council_json TEXT,
      tests_json TEXT,
      status VARCHAR(30) DEFAULT 'Đã lên lịch'
    );

    -- 11E. Table LeaveApplication (Đơn xin nghỉ phép)
    CREATE TABLE IF NOT EXISTS LeaveApplication (
      leave_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      leave_code VARCHAR(50) UNIQUE NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      employee_code VARCHAR(50),
      employee_name VARCHAR(100),
      department_id VARCHAR(36),
      department_name VARCHAR(100),
      approver_id VARCHAR(36),
      approver_name VARCHAR(100),
      related_person_id VARCHAR(36),
      related_person_name VARCHAR(100),
      start_date BIGINT NOT NULL,
      end_date BIGINT NOT NULL,
      total_days DECIMAL DEFAULT 1.0,
      reason VARCHAR(500),
      details_json TEXT,
      approver_note VARCHAR(255),
      status VARCHAR(30) DEFAULT 'PENDING'
    );
    CREATE TABLE IF NOT EXISTS AuditLog (
      audit_id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36),
      username VARCHAR(100),
      action VARCHAR(50) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id VARCHAR(36),
      entity_name VARCHAR(255),
      details TEXT,
      created_date BIGINT NOT NULL
    );

    -- Phiếu Đánh giá phỏng vấn
    CREATE TABLE IF NOT EXISTS InterviewEvaluation (
      interview_eval_id VARCHAR(36) PRIMARY KEY,
      eval_code VARCHAR(50),
      evaluation_date BIGINT,
      schedule_id VARCHAR(36),
      candidate_id VARCHAR(36) NOT NULL,
      duration_minutes INT,
      level_score INT DEFAULT 5,
      overall_result VARCHAR(20),
      overall_comment VARCHAR(1000),
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      FOREIGN KEY (candidate_id) REFERENCES Candidate(candidate_id),
      FOREIGN KEY (schedule_id) REFERENCES InterviewSchedule(schedule_id)
    );

    -- Kịch bản phỏng vấn (bảng con: Câu hỏi / Kỳ vọng / Câu trả lời)
    CREATE TABLE IF NOT EXISTS InterviewEvaluationScript (
      script_id VARCHAR(36) PRIMARY KEY,
      interview_eval_id VARCHAR(36) NOT NULL,
      row_order INT DEFAULT 1,
      question VARCHAR(500),
      expectation VARCHAR(500),
      answer VARCHAR(1000),
      FOREIGN KEY (interview_eval_id) REFERENCES InterviewEvaluation(interview_eval_id)
    );

    -- Chi tiết điều kiện đánh giá (bảng con - cùng cấu trúc với PreScreeningCriteria)
    CREATE TABLE IF NOT EXISTS InterviewEvaluationCriteria (
      criteria_detail_id VARCHAR(36) PRIMARY KEY,
      interview_eval_id VARCHAR(36) NOT NULL,
      row_order INT DEFAULT 1,
      criteria_type VARCHAR(100),
      required_from VARCHAR(255),
      required_description VARCHAR(500),
      candidate_value VARCHAR(255),
      candidate_description VARCHAR(500),
      is_passed INTEGER DEFAULT 0,
      note VARCHAR(500),
      FOREIGN KEY (interview_eval_id) REFERENCES InterviewEvaluation(interview_eval_id)
    );

    -- Phiếu Sơ loại ứng viên (Pre-screening)
    CREATE TABLE IF NOT EXISTS PreScreening (
      pre_screening_id VARCHAR(36) PRIMARY KEY,
      screening_code VARCHAR(50),
      candidate_id VARCHAR(36) NOT NULL,
      received_date BIGINT,
      culture_level VARCHAR(50),
      education_level VARCHAR(100),
      education_school VARCHAR(150),
      position_id VARCHAR(36),
      department_id VARCHAR(36),
      screening_date BIGINT,
      level_score INT DEFAULT 5,
      screening_result VARCHAR(20),
      comment VARCHAR(1000),
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      FOREIGN KEY (candidate_id) REFERENCES Candidate(candidate_id),
      FOREIGN KEY (position_id) REFERENCES Position(position_id),
      FOREIGN KEY (department_id) REFERENCES Department(department_id)
    );

    -- Chi tiết điều kiện sơ loại (bảng con lặp lại của PreScreening)
    CREATE TABLE IF NOT EXISTS PreScreeningCriteria (
      criteria_detail_id VARCHAR(36) PRIMARY KEY,
      pre_screening_id VARCHAR(36) NOT NULL,
      row_order INT DEFAULT 1,
      criteria_type VARCHAR(100),
      required_from VARCHAR(255),
      required_description VARCHAR(500),
      candidate_value VARCHAR(255),
      candidate_description VARCHAR(500),
      is_passed INTEGER DEFAULT 0,
      note VARCHAR(500),
      FOREIGN KEY (pre_screening_id) REFERENCES PreScreening(pre_screening_id)
    );

    -- Workflow duyệt nhiều cấp: mỗi dòng là 1 cấp duyệt của 1 phiếu/đơn cụ thể
    CREATE TABLE IF NOT EXISTS ApprovalHistory (
      approval_id VARCHAR(36) PRIMARY KEY,
      document_type VARCHAR(50) NOT NULL,
      document_id VARCHAR(36) NOT NULL,
      level_order INT NOT NULL,
      required_role VARCHAR(50) NOT NULL,
      department_scope VARCHAR(36),
      approver_employee_id VARCHAR(36),
      approver_name VARCHAR(100),
      status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
      comment VARCHAR(500),
      submitted_date BIGINT,
      decided_date BIGINT,
      created_date BIGINT NOT NULL
    );


    -- 12. Table Offer
    CREATE TABLE IF NOT EXISTS Offer (
      offer_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      candidate_id VARCHAR(36) NOT NULL,
      offer_date BIGINT,
      expected_start_date BIGINT,
      probation_salary DECIMAL DEFAULT 0,
      official_salary DECIMAL DEFAULT 0,
      salary_offer DECIMAL DEFAULT 0,
      offer_status VARCHAR(30) DEFAULT 'SENT',
      note VARCHAR(255),
      FOREIGN KEY (candidate_id) REFERENCES Candidate(candidate_id)
    );

    -- 13. Table ContractProposal (Phiếu Đề xuất HĐLĐ)
    CREATE TABLE IF NOT EXISTS ContractProposal (
      proposal_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      proposal_code VARCHAR(30) UNIQUE NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      contract_type VARCHAR(50) NOT NULL,
      proposed_salary DECIMAL DEFAULT 0,
      proposed_start_date BIGINT,
      reason VARCHAR(255),
      status VARCHAR(30) DEFAULT 'PENDING',
      FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
    );

    -- 14. Table ContractExtension (Phiếu Gia hạn HĐLĐ)
    CREATE TABLE IF NOT EXISTS ContractExtension (
      extension_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      extension_code VARCHAR(30) UNIQUE NOT NULL,
      contract_id VARCHAR(36) NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      new_end_date BIGINT,
      new_salary DECIMAL DEFAULT 0,
      extension_term VARCHAR(50),
      reason VARCHAR(255),
      status VARCHAR(30) DEFAULT 'APPROVED',
      FOREIGN KEY (contract_id) REFERENCES EmployeeContract(contract_id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
    );

    -- 15. Table TransferProposal (Phiếu Đề xuất Thuyên chuyển, Bổ nhiệm)
    CREATE TABLE IF NOT EXISTS TransferProposal (
      proposal_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      proposal_code VARCHAR(30) UNIQUE NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      current_department_id VARCHAR(36),
      target_department_id VARCHAR(36),
      current_position_id VARCHAR(36),
      target_position_id VARCHAR(36),
      proposed_effective_date BIGINT,
      reason VARCHAR(255),
      status VARCHAR(30) DEFAULT 'PENDING',
      FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
    );

    -- 16. Table TransferDecision (Phiếu Quyết định Thuyên chuyển, Bổ nhiệm)
    CREATE TABLE IF NOT EXISTS TransferDecision (
      decision_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      decision_number VARCHAR(50) UNIQUE NOT NULL,
      proposal_id VARCHAR(36),
      employee_id VARCHAR(36) NOT NULL,
      target_department_id VARCHAR(36),
      target_position_id VARCHAR(36),
      effective_date BIGINT,
      signed_by VARCHAR(100),
      reason VARCHAR(255),
      status VARCHAR(30) DEFAULT 'EXECUTED',
      FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
    );

    -- 17. Table ResignationApplication (Phiếu Đơn xin nghỉ việc)
    CREATE TABLE IF NOT EXISTS ResignationApplication (
      application_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      application_code VARCHAR(30) UNIQUE NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      desired_resign_date BIGINT,
      reason VARCHAR(500),
      handover_notes VARCHAR(500),
      status VARCHAR(30) DEFAULT 'PENDING',
      FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
    );

    -- 18. Table ResignationDecision (Phiếu Quyết định nghỉ việc)
    CREATE TABLE IF NOT EXISTS ResignationDecision (
      decision_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      decision_number VARCHAR(50) UNIQUE NOT NULL,
      application_id VARCHAR(36),
      employee_id VARCHAR(36) NOT NULL,
      official_resign_date BIGINT,
      handover_status VARCHAR(50) DEFAULT 'COMPLETED',
      signed_by VARCHAR(100),
      reason VARCHAR(255),
      status VARCHAR(30) DEFAULT 'EXECUTED',
      FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
    );

    -- 19. Table EvaluationCriteria (Danh mục Tiêu chí Đánh giá)
    CREATE TABLE IF NOT EXISTS EvaluationCriteria (
      criteria_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      criteria_code VARCHAR(30) UNIQUE NOT NULL,
      criteria_name VARCHAR(150) NOT NULL,
      weight DECIMAL DEFAULT 25,
      description VARCHAR(255),
      status INT DEFAULT 1
    );

    -- 20. Table EvaluationScale (Chi tiết Thang điểm theo Tiêu chí)
    CREATE TABLE IF NOT EXISTS EvaluationScale (
      scale_id VARCHAR(36) PRIMARY KEY,
      criteria_id VARCHAR(36) NOT NULL,
      grade_name VARCHAR(50) NOT NULL,
      min_score DECIMAL DEFAULT 0,
      max_score DECIMAL DEFAULT 10,
      description VARCHAR(255),
      FOREIGN KEY (criteria_id) REFERENCES EvaluationCriteria(criteria_id) ON DELETE CASCADE
    );

    -- 21. Table EmployeeEvaluation (Phiếu Đánh giá Nhân viên)
    CREATE TABLE IF NOT EXISTS EmployeeEvaluation (
      evaluation_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      evaluation_code VARCHAR(30) UNIQUE NOT NULL,
      evaluation_date BIGINT,
      year INT DEFAULT 2026,
      evaluator_id VARCHAR(36) NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      department_id VARCHAR(36),
      position_id VARCHAR(36),
      total_score DECIMAL DEFAULT 0,
      grade_result VARCHAR(50),
      description VARCHAR(500),
      status VARCHAR(30) DEFAULT 'COMPLETED',
      FOREIGN KEY (evaluator_id) REFERENCES Employee(employee_id),
      FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
    );

    -- 22. Table EmployeeEvaluationDetail (Chi tiết các Tiêu chí trong Phiếu Đánh giá)
    CREATE TABLE IF NOT EXISTS EmployeeEvaluationDetail (
      detail_id VARCHAR(36) PRIMARY KEY,
      evaluation_id VARCHAR(36) NOT NULL,
      criteria_id VARCHAR(36) NOT NULL,
      criteria_code VARCHAR(30),
      criteria_name VARCHAR(150),
      weight DECIMAL DEFAULT 0,
      score DECIMAL DEFAULT 0,
      note VARCHAR(255),
      FOREIGN KEY (evaluation_id) REFERENCES EmployeeEvaluation(evaluation_id) ON DELETE CASCADE
    );

    -- 23. Table RewardDisciplineProposal (Phiếu Đề xuất Khen thưởng/Kỷ luật)
    CREATE TABLE IF NOT EXISTS RewardDisciplineProposal (
      proposal_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      proposal_code VARCHAR(30) UNIQUE NOT NULL,
      record_type VARCHAR(20) NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      proposed_amount DECIMAL DEFAULT 0,
      reason VARCHAR(500),
      proposed_by VARCHAR(100),
      status VARCHAR(30) DEFAULT 'PENDING',
      FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
    );
    -- 24. Table ContractType (Danh mục Loại HĐLĐ Dùng chung)
    CREATE TABLE IF NOT EXISTS ContractType (
      contract_type_id VARCHAR(36) PRIMARY KEY,
      created_date BIGINT NOT NULL,
      last_modified_date BIGINT NOT NULL,
      contract_type_code VARCHAR(50) UNIQUE NOT NULL,
      contract_type_name VARCHAR(100) NOT NULL,
      duration_months INT DEFAULT 0,
      has_probation INT DEFAULT 0,
      probation_days INT DEFAULT 0,
      status INT DEFAULT 1
    );

    -- 25. Table PositionContractPathway (Lộ trình ký HĐLĐ theo Vị trí)
    CREATE TABLE IF NOT EXISTS PositionContractPathway (
      pathway_id VARCHAR(36) PRIMARY KEY,
      position_id VARCHAR(36) NOT NULL,
      contract_type_id VARCHAR(36) NOT NULL,
      step_order INT DEFAULT 1,
      note VARCHAR(255),
      created_date BIGINT NOT NULL,
      FOREIGN KEY (position_id) REFERENCES Position(position_id) ON DELETE CASCADE,
      FOREIGN KEY (contract_type_id) REFERENCES ContractType(contract_type_id)
    );
  `;

    exec(schemaSql);

    const { run } = require('./connection');
    try { run(`ALTER TABLE Department ADD COLUMN target_headcount INT DEFAULT 0`); } catch (e) { }
    try { run(`ALTER TABLE Department ADD COLUMN parent_department_id VARCHAR(36)`); } catch (e) { }
    try { run(`ALTER TABLE Position ADD COLUMN target_headcount INT DEFAULT 0`); } catch (e) { }
    try { run(`ALTER TABLE Position ADD COLUMN is_assistant INT DEFAULT 0`); } catch (e) { }
    try { run(`ALTER TABLE Position ADD COLUMN salary_grade VARCHAR(50)`); } catch (e) { }
    try { run(`ALTER TABLE RecruitmentRequest ADD COLUMN is_outside_headcount INT DEFAULT 0`); } catch (e) { }
    try { run(`ALTER TABLE Employee ADD COLUMN level VARCHAR(50) DEFAULT 'Nhân viên'`); } catch (e) { }
    try { run(`ALTER TABLE Offer ADD COLUMN probation_salary DECIMAL DEFAULT 0`); } catch (e) { }
    try { run(`ALTER TABLE Offer ADD COLUMN official_salary DECIMAL DEFAULT 0`); } catch (e) { }
    // Liên kết User -> Employee (bắt buộc để: chỉ xem hồ sơ bản thân, kiểm tra hội đồng phỏng vấn theo đúng người)
    try { run(`ALTER TABLE User ADD COLUMN employee_id VARCHAR(36)`); } catch (e) { }

    console.log('BRAVO HRM Schema initialized & columns updated successfully.');
};

module.exports = { initSchema };