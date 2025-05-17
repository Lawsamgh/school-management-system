<template>
  <div class="container py-4 mt-4">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-0 text-gray-800">User Management</h1>
        <p class="mb-0">Manage all system users and their roles</p>
      </div>
      <button 
        class="btn btn-primary" 
        @click="openAddUserModal"
        :disabled="userRole === 'superadmin' && !authStore.getSelectedSchoolId"
        :title="userRole === 'superadmin' && !authStore.getSelectedSchoolId ? 'Please select a school first' : ''"
      >
        <i class="fas fa-user-plus me-2"></i>Add New User
      </button>
    </div>

    <!-- School Selector for Superadmin -->
    <div v-if="userRole === 'superadmin'" class="mb-4">
      <SchoolSelector @school-selected="handleSchoolSelected" />
    </div>

    <!-- Show message when no school is selected for superadmin -->
    <div v-if="userRole === 'superadmin' && !authStore.getSelectedSchoolId" class="alert alert-info">
      <i class="fas fa-info-circle me-2"></i>
      Please select a school to view and manage its users.
    </div>

    <!-- Modern Add User Modal -->
    <AddUserModal 
      v-model="showAddUserModal"
      @user-added="fetchUsers"
    />

    <!-- Edit User Modal -->
    <transition name="modern-modal-fade">
      <div v-if="showEditUserModal" class="modern-modal-overlay">
        <div class="modern-modal-card" :class="{ 'expanded': editUserForm.role === 'student' || editUserForm.role === 'teacher' }">
          <button class="modern-modal-close" @click="closeEditUserModal" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
          <div class="modern-modal-header">
            <h2>Edit User</h2>
            <p class="text-muted mb-0">Update user details and role</p>
          </div>
          <form class="modern-modal-form" @submit.prevent="handleEditUser">
            <div class="row" :class="{ 'expanded': editUserForm.role === 'student' || editUserForm.role === 'teacher' }">
              <!-- Basic Information Section -->
              <div :class="[
                'transition-width',
                (editUserForm.role === 'student' || editUserForm.role === 'teacher') ? 'col-md-6' : 'col-md-12'
              ]">
                <div class="form-section h-100">
                  <h6 class="section-title">Basic Information</h6>
                  <div class="row g-3">
                    <div class="col-md-12">
                      <select 
                        class="form-select" 
                        v-model="editUserForm.role" 
                        required 
                        @change="handleRoleChange"
                      >
                        <option value="" disabled>Select role</option>
                        <option v-for="role in roleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
                      </select>
                    </div>
                    <div class="col-md-12">
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="editUserForm.identification" 
                        placeholder="Enter identification number"
                        required
                      >
                    </div>
                    <div class="col-md-12">
                      <input 
                        type="email" 
                        class="form-control" 
                        v-model="editUserForm.email" 
                        placeholder="Email address"
                        disabled
                      >
                    </div>
                    <div class="col-md-12">
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="editUserForm.username" 
                        placeholder="Enter username"
                        required
                      >
                    </div>
                    <div class="col-md-6">
                      <input 
                        type="date" 
                        class="form-control" 
                        v-model="editUserForm.dob" 
                        placeholder="Date of Birth" 
                        required
                        @change="calculateAgeForEdit"
                      >
                    </div>
                    <div class="col-md-6">
                      <input 
                        type="number" 
                        class="form-control" 
                        v-model="editUserForm.age" 
                        placeholder="Age" 
                        min="0" 
                        required
                        readonly
                        :style="{ backgroundColor: '#f8f9fa' }"
                      >
                    </div>
                    <div class="col-md-12">
                      <div class="custom-select-container">
                        <input 
                          type="text" 
                          class="form-control" 
                          v-model="genderSearch"
                          @focus="showGenderDropdown = true"
                          @input="handleGenderSearch"
                          :placeholder="editUserForm.gender ? genderOptions.find(g => g.value === editUserForm.gender)?.label : 'Search gender'"
                        >
                        <div v-if="showGenderDropdown" class="custom-select-dropdown">
                          <div class="custom-select-options">
                            <div 
                              v-for="option in filteredGenders" 
                              :key="option.value"
                              class="custom-select-option"
                              @click="selectGender(option)"
                              :class="{ 'selected': option.value === editUserForm.gender }"
                            >
                              {{ option.label }}
                            </div>
                            <div v-if="filteredGenders.length === 0" class="no-results">
                              No results found
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-12">
                      <div class="custom-select-container">
                        <input 
                          type="text" 
                          class="form-control" 
                          v-model="nationalitySearch"
                          @focus="showNationalityDropdown = true"
                          @input="handleNationalitySearch"
                          :placeholder="editUserForm.nationality ? nationalityOptions.find(n => n.value === editUserForm.nationality)?.label : 'Search nationality'"
                        >
                        <div v-if="showNationalityDropdown" class="custom-select-dropdown">
                          <div class="custom-select-options">
                            <div 
                              v-for="option in filteredNationalities" 
                              :key="option.value"
                              class="custom-select-option"
                              @click="selectNationality(option)"
                              :class="{ 'selected': option.value === editUserForm.nationality }"
                            >
                              {{ option.label }}
                            </div>
                            <div v-if="filteredNationalities.length === 0" class="no-results">
                              No results found
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-12">
                      <div class="custom-select-container">
                        <input 
                          type="text" 
                          class="form-control" 
                          v-model="religionSearch"
                          @focus="showReligionDropdown = true"
                          @input="handleReligionSearch"
                          :placeholder="editUserForm.religion ? religionOptions.find(r => r.value === editUserForm.religion)?.label : 'Search religion'"
                        >
                        <div v-if="showReligionDropdown" class="custom-select-dropdown">
                          <div class="custom-select-options">
                            <div 
                              v-for="option in filteredReligions" 
                              :key="option.value"
                              class="custom-select-option"
                              @click="selectReligion(option)"
                              :class="{ 'selected': option.value === editUserForm.religion }"
                            >
                              {{ option.label }}
                            </div>
                            <div v-if="filteredReligions.length === 0" class="no-results">
                              No results found
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Role-specific Information Section -->
              <transition name="slide-fade">
                <div v-if="editUserForm.role === 'student' || editUserForm.role === 'teacher'" class="col-md-6 fade-enter">
                  <div class="form-section h-100">
                    <h6 class="section-title">ACADEMIC INFORMATION</h6>
                    <div class="row g-3">
                      <!-- Academic Information -->
                      <div class="col-md-12">
                        <select 
                          class="form-select" 
                          v-model="editUserForm.class_id" 
                          :disabled="isLoadingClasses" 
                          required
                        >
                          <option value="" disabled>{{ editUserForm.role === 'student' ? 'Select class' : 'Select teaching class' }}</option>
                          <option v-for="c in classes" :key="c.class_id" :value="c.class_id">{{ c.class_name }}</option>
                        </select>
                      </div>

                      <!-- PARENT INFORMATION - Only for Students -->
                      <template v-if="editUserForm.role === 'student'">
                        <div class="col-12">
                          <h6 class="section-subtitle">PARENT INFORMATION</h6>
                        </div>
                        <div class="col-md-12">
                          <input 
                            type="text" 
                            class="form-control" 
                            v-model="editUserForm.family_name" 
                            placeholder="Parent/Guardian Name" 
                            required
                          >
                        </div>
                        <div class="col-md-12">
                          <div class="custom-select-container">
                            <input 
                              type="text" 
                              class="form-control" 
                              v-model="relationshipSearch"
                              @focus="showRelationshipDropdown = true"
                              @input="handleRelationshipSearch"
                              :placeholder="editUserForm.family_relationship ? relationshipOptions.find(r => r.value === editUserForm.family_relationship)?.label : 'Select relationship'"
                            >
                            <div v-if="showRelationshipDropdown" class="custom-select-dropdown">
                              <div class="custom-select-options">
                                <div 
                                  v-for="option in filteredRelationships" 
                                  :key="option.value"
                                  class="custom-select-option"
                                  @click="selectRelationship(option)"
                                  :class="{ 'selected': option.value === editUserForm.family_relationship }"
                                >
                                  {{ option.label }}
                                </div>
                                <div v-if="filteredRelationships.length === 0" class="no-results">
                                  No results found
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-12">
                          <input 
                            type="email" 
                            class="form-control" 
                            v-model="editUserForm.family_email" 
                            placeholder="Parent/Guardian Email" 
                            required
                          >
                        </div>
                        <div class="col-md-12">
                          <input 
                            type="tel" 
                            class="form-control" 
                            v-model="editUserForm.emergency_contact" 
                            placeholder="Emergency Contact Number" 
                            required
                          >
                        </div>
                        <div class="col-md-12">
                          <textarea 
                            class="form-control" 
                            v-model="editUserForm.address" 
                            placeholder="Home Address"
                            rows="3"
                            required
                          ></textarea>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="closeEditUserModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="editUserLoading">
                <span v-if="editUserLoading" class="spinner-border spinner-border-sm me-2"></span>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Delete User Modal -->
    <transition name="modern-modal-fade">
      <div v-if="showDeleteUserModal" class="modern-modal-overlay">
        <div class="modern-modal-card modal-sm">
          <button class="modern-modal-close" @click="closeDeleteUserModal" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
          <div class="modern-modal-header text-center">
            <div class="modal-icon modal-icon-danger mb-3">
              <i class="fas fa-trash-alt"></i>
            </div>
            <h2>Delete User</h2>
            <p class="text-muted mb-0">This action cannot be undone</p>
          </div>
          <div class="modal-body text-center">
            <div class="user-info-box">
              <div class="user-email">{{ deleteUserTarget?.email }}</div>
              <div class="user-role" :class="getRoleBadgeClass(deleteUserTarget?.role || '')">
                {{ deleteUserTarget?.role }}
              </div>
            </div>
          </div>
          <div class="modal-footer d-flex justify-content-center gap-2">
            <button type="button" class="btn btn-light" @click="closeDeleteUserModal">
              Cancel
            </button>
            <button type="button" class="btn btn-danger" @click="confirmDeleteUser" :disabled="deleteUserLoading">
              <span v-if="deleteUserLoading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-trash-alt me-2"></i>
              Delete User
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- View User Modal -->
    <transition name="modern-modal-fade">
      <div v-if="showViewUserModal" class="modern-modal-overlay">
        <div class="modern-modal-card">
          <button class="modern-modal-close" @click="closeViewUserModal" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
          <div class="modern-modal-header">
            <h2>User Details</h2>
            <p class="text-muted mb-0">View user information</p>
          </div>
          <div class="modern-modal-form">
            <!-- User Profile Header -->
            <div class="user-profile-header">
              <div class="user-role-badge" :class="getRoleBadgeClass(viewUserTarget?.role || '')">
                {{ viewUserTarget?.role || 'User' }}
              </div>
              <h3 class="user-profile-name">{{ viewUserTarget?.username }}</h3>
              <div class="user-profile-email">{{ viewUserTarget?.email }}</div>
              <div class="user-profile-status" :class="'status-' + (viewUserTarget?.status || 'pending').toLowerCase()">
                <i class="fas fa-circle status-indicator"></i> {{ viewUserTarget?.status || 'Pending' }}
              </div>
            </div>

            <!-- Tabs for different sections -->
            <div class="user-details-tabs">
              <div class="user-details-tabs-container">
                <button 
                  class="user-details-tab-btn" 
                  :class="{ 'active': activeUserDetailsTab === 'basic' }" 
                  @click="activeUserDetailsTab = 'basic'"
                >
                  <i class="fas fa-user"></i> Basic Info
                </button>
                <button 
                  v-if="viewUserTarget?.role === 'student'"
                  class="user-details-tab-btn" 
                  :class="{ 'active': activeUserDetailsTab === 'family' }" 
                  @click="activeUserDetailsTab = 'family'"
                >
                  <i class="fas fa-users"></i> Family & Contact
                </button>
                <button 
                  v-if="['teacher', 'student'].includes(viewUserTarget?.role ?? '')"
                  class="user-details-tab-btn" 
                  :class="{ 'active': activeUserDetailsTab === 'additional' }" 
                  @click="activeUserDetailsTab = 'additional'"
                >
                  <i class="fas fa-id-card"></i> Additional
                </button>
              </div>
            </div>

            <!-- Tab Content -->
            <div class="user-details-tab-content">
              <!-- Basic Information Tab -->
              <div v-if="activeUserDetailsTab === 'basic'" class="user-details-tab-pane active">
                <div class="form-section user-details-section">
                  <h6 class="section-title">Basic Information</h6>
                  <div class="row g-4">
                    <div class="col-md-12 user-details-field" v-if="['teacher', 'student', 'parent', 'accountant', 'registrar', 'admin'].includes(viewUserTarget?.role ?? '')">
                      <div class="info-card">
                        <div class="info-icon"><i class="fas fa-id-badge"></i></div>
                        <div class="info-content">
                          <span class="user-details-label">Identification</span>
                          <span class="user-details-value">{{ viewUserTarget?.identification || '—' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 user-details-field">
                      <div class="info-card">
                        <div class="info-icon"><i class="fas fa-calendar-alt"></i></div>
                        <div class="info-content">
                          <span class="user-details-label">Date of Birth</span>
                          <span class="user-details-value">{{ viewUserTarget?.dob || '—' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 user-details-field">
                      <div class="info-card">
                        <div class="info-icon"><i class="fas fa-sort-numeric-up"></i></div>
                        <div class="info-content">
                          <span class="user-details-label">Age</span>
                          <span class="user-details-value">{{ viewUserTarget?.age || '—' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 user-details-field">
                      <div class="info-card">
                        <div class="info-icon"><i class="fas fa-venus-mars"></i></div>
                        <div class="info-content">
                          <span class="user-details-label">Gender</span>
                          <span class="user-details-value text-capitalize">{{ viewUserTarget?.gender || '—' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 user-details-field">
                      <div class="info-card">
                        <div class="info-icon"><i class="fas fa-flag"></i></div>
                        <div class="info-content">
                          <span class="user-details-label">Nationality</span>
                          <span class="user-details-value text-capitalize">{{ viewUserTarget?.nationality || '—' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 user-details-field">
                      <div class="info-card">
                        <div class="info-icon"><i class="fas fa-pray"></i></div>
                        <div class="info-content">
                          <span class="user-details-label">Religion</span>
                          <span class="user-details-value text-capitalize">{{ viewUserTarget?.religion || '—' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 user-details-field">
                      <div class="info-card">
                        <div class="info-icon"><i class="fas fa-clock"></i></div>
                        <div class="info-content">
                          <span class="user-details-label">Last Login</span>
                          <span class="user-details-value">{{ formatDate(viewUserTarget?.last_sign_in_at ?? null) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Family & Contact Tab (Only for students) -->
              <div v-if="activeUserDetailsTab === 'family' && viewUserTarget?.role === 'student'" class="user-details-tab-pane active">
                <div class="form-section user-details-section">
                  <h6 class="section-title">Family & Contact Information</h6>
                  <div class="row g-4">
                    <div class="col-md-6 user-details-field">
                      <div class="info-card">
                        <div class="info-icon"><i class="fas fa-user-friends"></i></div>
                        <div class="info-content">
                          <span class="user-details-label">Family Name</span>
                          <span class="user-details-value">{{ viewUserTarget?.family_name || '—' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 user-details-field">
                      <div class="info-card">
                        <div class="info-icon"><i class="fas fa-people-arrows"></i></div>
                        <div class="info-content">
                          <span class="user-details-label">Family Relationship</span>
                          <span class="user-details-value text-capitalize">{{ viewUserTarget?.family_relationship || '—' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 user-details-field">
                      <div class="info-card">
                        <div class="info-icon"><i class="fas fa-envelope"></i></div>
                        <div class="info-content">
                          <span class="user-details-label">Family Email</span>
                          <span class="user-details-value">{{ viewUserTarget?.family_email || '—' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 user-details-field">
                      <div class="info-card">
                        <div class="info-icon"><i class="fas fa-phone-alt"></i></div>
                        <div class="info-content">
                          <span class="user-details-label">Emergency Contact</span>
                          <span class="user-details-value">{{ viewUserTarget?.emergency_contact || '—' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-12 user-details-field">
                      <div class="info-card">
                        <div class="info-icon"><i class="fas fa-map-marker-alt"></i></div>
                        <div class="info-content">
                          <span class="user-details-label">Address</span>
                          <span class="user-details-value">{{ viewUserTarget?.address || '—' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Additional Information Tab -->
              <div v-if="activeUserDetailsTab === 'additional' && ['teacher', 'student'].includes(viewUserTarget?.role ?? '')" class="user-details-tab-pane active">
                <div class="form-section user-details-section">
                  <h6 class="section-title">Additional Information</h6>
                  <div class="row g-4">
                    <div v-if="['student', 'teacher'].includes(viewUserTarget?.role ?? '')" class="col-md-12 user-details-field">
                      <div class="info-card">
                        <div class="info-icon"><i class="fas fa-chalkboard"></i></div>
                        <div class="info-content">
                          <span class="user-details-label">Class</span>
                          <span class="user-details-value">{{ viewUserTarget?.class_name || '—' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="closeViewUserModal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Search and Filter Section -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <div class="search-box">
              <i class="fas fa-search search-icon"></i>
              <input
                type="text"
                class="form-control search-input"
                placeholder="Search users..."
                v-model="searchQuery"
                @input="handleSearch"
              >
            </div>
          </div>
          <div class="col-12 col-md-3">
            <select class="form-select" v-model="roleFilter">
              <option value="">All Roles</option>
              <option v-for="role in roleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
            </select>
          </div>
          <div class="col-12 col-md-3">
            <select class="form-select" v-model="statusFilter">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div class="col-12 col-md-2">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Role</th>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                <th>Last Login</th>
                <th style="min-width: 200px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="isLoading">
                <tr v-for="n in 6" :key="n">
                  <td><div class="skeleton skeleton-badge"></div></td>
                  <td><div class="skeleton skeleton-text"></div></td>
                  <td><div class="skeleton skeleton-text"></div></td>
                  <td><div class="skeleton skeleton-badge"></div></td>
                  <td><div class="skeleton skeleton-text short"></div></td>
                  <td><div class="skeleton skeleton-actions"></div></td>
                </tr>
              </template>
              <template v-else>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>
                    <span :class="getRoleBadgeClass(user.role)">
                      {{ user.role }}
                    </span>
                  </td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="getStatusBadgeClass(user.status)">
                      {{ user.status }}
                    </span>
                  </td>
                  <td>
                    <span :title="user.last_sign_in_at ?? undefined">
                      {{ formatDate(user.last_sign_in_at) }}
                    </span>
                  </td>
                  <td>
                    <div class="actions-container d-flex flex-wrap gap-2">
                      <button 
                        class="btn btn-sm btn-outline-info" 
                        @click="openViewUserModal(user)"
                        title="View User"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-primary" 
                        @click="openEditUserModal(user)"
                        title="Edit User"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button 
                        v-if="currentUserRole !== 'registrar'"
                        class="btn btn-sm btn-outline-danger" 
                        @click="openDeleteUserModal(user)"
                        title="Delete User"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                      <button 
                        v-if="currentUserRole !== 'registrar'"
                        class="btn btn-sm btn-outline-warning" 
                        @click="openResetPasswordModal(user)"
                        title="Reset Password"
                      >
                        <i class="fas fa-key"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center mt-4">
          <div class="text-muted">
            Showing {{ paginationStart }} to {{ paginationEnd }} of {{ totalUsers }} users
          </div>
          <nav aria-label="Page navigation">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="prevPage">Previous</button>
              </li>
              <li 
                v-for="page in totalPages" 
                :key="page" 
                class="page-item"
                :class="{ active: currentPage === page }"
              >
                <button class="page-link" @click="goToPage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="nextPage">Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <transition name="modern-modal-fade">
      <div v-if="showResetPasswordModal" class="modern-modal-overlay">
        <div class="modern-modal-card modal-sm">
          <button class="modern-modal-close" @click="closeResetPasswordModal" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
          <div class="modern-modal-header text-center">
            <div class="modal-icon modal-icon-warning mb-3">
              <i class="fas fa-key"></i>
            </div>
            <h2>Reset Password</h2>
            <p class="text-muted mb-0">Are you sure you want to reset the password?</p>
          </div>
          <div class="modal-body text-center">
            <div class="user-info-box">
              <div class="user-email">{{ resetPasswordTarget?.email }}</div>
              <div class="user-role" :class="getRoleBadgeClass(resetPasswordTarget?.role || '')">
                {{ resetPasswordTarget?.role }}
              </div>
            </div>
            <div class="password-info mt-3">
              <div class="password-label text-muted">New password will be:</div>
              <div class="password-value">12345678</div>
            </div>
          </div>
          <div class="modal-footer d-flex justify-content-center gap-2">
            <button type="button" class="btn btn-light" @click="closeResetPasswordModal">
              Cancel
            </button>
            <button type="button" class="btn btn-warning" @click="confirmResetPassword" :disabled="resetPasswordLoading">
              <span v-if="resetPasswordLoading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-key me-2"></i>
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase'
import { logActivity } from '@/lib/auditLogger'
import { getUsersWithRoles, deleteUser as deleteUserApi, addUserWithRole, updateUserWithRole, getClasses, resetUserPassword } from '@/api/users'
import AddUserModal from '@/components/AddUserModal.vue'
import SchoolSelector from '@/components/SchoolSelector.vue'

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  role: string
  status: string
  name?: string
  avatar_url?: string
  username: string
  identification?: string | null
  dob?: string | null
  age?: number | null
  gender?: string | null
  class_id?: string | null
  class_name?: string | null
  nationality?: string | null
  religion?: string | null
  family_name?: string | null
  family_relationship?: string | null
  family_email?: string | null
  address?: string | null
  emergency_contact?: string | null
  school_id?: string | null
}

interface Grade {
  id: number
  grade_level: string
}

// Add interface for user creation
interface CreateUserData {
  email: string
  username: string
  role: string
  identification?: string
  dob?: string
  age?: number
  gender?: string
  class_id?: string
  nationality?: string
  religion?: string
  school_id?: string | null
}

const toast = useToast()
const isLoading = ref(true)
const users = ref<User[]>([])
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const selectedUsers = ref<string[]>([])
const selectAll = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10
const showAddUserModal = ref(false)
const addUserForm = ref({
  email: '',
  password: '',
  username: '',
  role: '',
  identification: '',
  dob: '',
  age: '',
  gender: '',
  class_id: '',
  nationality: '',
  religion: ''
})
const addUserLoading = ref(false)
const showEditUserModal = ref(false)
const editUserForm = ref({ 
  email: '', 
  username: '', 
  role: '',
  identification: '',
  dob: '',
  age: '',
  gender: '',
  class_id: '',
  nationality: '',
  religion: '',
  family_name: '',
  family_relationship: '',
  family_email: '',
  address: '',
  emergency_contact: ''
})
const editUserLoading = ref(false)
const showDeleteUserModal = ref(false)
const deleteUserTarget = ref<User | null>(null)
const deleteUserLoading = ref(false)
const grades = ref<Grade[]>([])
const isLoadingGrades = ref(false)
const showViewUserModal = ref(false)
const viewUserTarget = ref<User | null>(null)
const authStore = useAuthStore()
const currentUserRole = computed(() => authStore.userRole?.role?.toLowerCase() || null)
const activeUserDetailsTab = ref('basic')

// Reset password state
const showResetPasswordModal = ref(false)
const resetPasswordTarget = ref<User | null>(null)
const resetPasswordLoading = ref(false)

// Add computed property for current user's role
const userRole = computed(() => authStore.userRole?.role?.toLowerCase() || null)

// Pagination computed properties
const totalUsers = computed(() => filteredUsers.value.length)
const totalPages = computed(() => Math.ceil(totalUsers.value / itemsPerPage))
const paginationStart = computed(() => (currentPage.value - 1) * itemsPerPage + 1)
const paginationEnd = computed(() => Math.min(currentPage.value * itemsPerPage, totalUsers.value))

// Filter users based on search and filters
const filteredUsers = computed(() => {
  let filtered = users.value;
  
  // Filter by school_id for registrar and non-superadmin roles
  if (currentUserRole.value === 'registrar' || (currentUserRole.value !== 'superadmin' && authStore.userRole?.school_id)) {
    const schoolId = authStore.userRole?.school_id;
    filtered = filtered.filter(user => user.school_id === schoolId);
  }
  
  // If user is registrar, only show students and parents
  if (currentUserRole.value === 'registrar') {
    filtered = filtered.filter(user => ['student', 'parent'].includes(user.role.toLowerCase()));
  }
  
  return filtered.filter(user => {
    const matchesSearch = !searchQuery.value || 
      (user.email?.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (user.username?.toLowerCase().includes(searchQuery.value.toLowerCase()));
    
    const matchesRole = !roleFilter.value || user.role === roleFilter.value;
    const matchesStatus = !statusFilter.value || user.status === statusFilter.value;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
})

// Add a computed property for role options
const allRoleOptions = [
  { value: 'superadmin', label: 'SuperAdmin' },
  { value: 'admin', label: 'Admin' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'registrar', label: 'Registrar' },
]
const roleOptions = computed(() => {
  if (currentUserRole.value === 'admin') {
    return allRoleOptions.filter(r => r.value !== 'superadmin')
  }
  if (currentUserRole.value === 'registrar') {
    return allRoleOptions.filter(r => ['student', 'parent'].includes(r.value))
  }
  return allRoleOptions
})

// Add gender options
const genderOptions = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
]

// Add nationality options
const nationalityOptions = [
  { value: '', label: 'Select nationality' },
  { value: 'afghan', label: 'Afghan' },
  { value: 'albanian', label: 'Albanian' },
  { value: 'algerian', label: 'Algerian' },
  { value: 'american', label: 'American' },
  { value: 'andorran', label: 'Andorran' },
  { value: 'angolan', label: 'Angolan' },
  { value: 'antiguan', label: 'Antiguan' },
  { value: 'argentine', label: 'Argentine' },
  { value: 'armenian', label: 'Armenian' },
  { value: 'australian', label: 'Australian' },
  { value: 'austrian', label: 'Austrian' },
  { value: 'azerbaijani', label: 'Azerbaijani' },
  { value: 'bahamian', label: 'Bahamian' },
  { value: 'bahraini', label: 'Bahraini' },
  { value: 'bangladeshi', label: 'Bangladeshi' },
  { value: 'barbadian', label: 'Barbadian' },
  { value: 'belarusian', label: 'Belarusian' },
  { value: 'belgian', label: 'Belgian' },
  { value: 'belizean', label: 'Belizean' },
  { value: 'beninese', label: 'Beninese' },
  { value: 'bhutanese', label: 'Bhutanese' },
  { value: 'bolivian', label: 'Bolivian' },
  { value: 'bosnian', label: 'Bosnian' },
  { value: 'botswanan', label: 'Botswanan' },
  { value: 'brazilian', label: 'Brazilian' },
  { value: 'british', label: 'British' },
  { value: 'bruneian', label: 'Bruneian' },
  { value: 'bulgarian', label: 'Bulgarian' },
  { value: 'burkinabe', label: 'Burkinabe' },
  { value: 'burmese', label: 'Burmese' },
  { value: 'burundian', label: 'Burundian' },
  { value: 'cambodian', label: 'Cambodian' },
  { value: 'cameroonian', label: 'Cameroonian' },
  { value: 'canadian', label: 'Canadian' },
  { value: 'cape verdean', label: 'Cape Verdean' },
  { value: 'central african', label: 'Central African' },
  { value: 'chadian', label: 'Chadian' },
  { value: 'chilean', label: 'Chilean' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'colombian', label: 'Colombian' },
  { value: 'comoran', label: 'Comoran' },
  { value: 'congolese', label: 'Congolese' },
  { value: 'costa rican', label: 'Costa Rican' },
  { value: 'croatian', label: 'Croatian' },
  { value: 'cuban', label: 'Cuban' },
  { value: 'cypriot', label: 'Cypriot' },
  { value: 'czech', label: 'Czech' },
  { value: 'danish', label: 'Danish' },
  { value: 'djibouti', label: 'Djibouti' },
  { value: 'dominican', label: 'Dominican' },
  { value: 'dutch', label: 'Dutch' },
  { value: 'east timorese', label: 'East Timorese' },
  { value: 'ecuadorean', label: 'Ecuadorean' },
  { value: 'egyptian', label: 'Egyptian' },
  { value: 'emirian', label: 'Emirian' },
  { value: 'equatorial guinean', label: 'Equatorial Guinean' },
  { value: 'eritrean', label: 'Eritrean' },
  { value: 'estonian', label: 'Estonian' },
  { value: 'ethiopian', label: 'Ethiopian' },
  { value: 'fijian', label: 'Fijian' },
  { value: 'filipino', label: 'Filipino' },
  { value: 'finnish', label: 'Finnish' },
  { value: 'french', label: 'French' },
  { value: 'gabonese', label: 'Gabonese' },
  { value: 'gambian', label: 'Gambian' },
  { value: 'georgian', label: 'Georgian' },
  { value: 'german', label: 'German' },
  { value: 'ghanaian', label: 'Ghanaian' },
  { value: 'greek', label: 'Greek' },
  { value: 'grenadian', label: 'Grenadian' },
  { value: 'guatemalan', label: 'Guatemalan' },
  { value: 'guinea-bissauan', label: 'Guinea-Bissauan' },
  { value: 'guinean', label: 'Guinean' },
  { value: 'guyanese', label: 'Guyanese' },
  { value: 'haitian', label: 'Haitian' },
  { value: 'herzegovinian', label: 'Herzegovinian' },
  { value: 'honduran', label: 'Honduran' },
  { value: 'hungarian', label: 'Hungarian' },
  { value: 'icelander', label: 'Icelander' },
  { value: 'indian', label: 'Indian' },
  { value: 'indonesian', label: 'Indonesian' },
  { value: 'iranian', label: 'Iranian' },
  { value: 'iraqi', label: 'Iraqi' },
  { value: 'irish', label: 'Irish' },
  { value: 'israeli', label: 'Israeli' },
  { value: 'italian', label: 'Italian' },
  { value: 'ivorian', label: 'Ivorian' },
  { value: 'jamaican', label: 'Jamaican' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'jordanian', label: 'Jordanian' },
  { value: 'kazakhstani', label: 'Kazakhstani' },
  { value: 'kenyan', label: 'Kenyan' },
  { value: 'kittian and nevisian', label: 'Kittian and Nevisian' },
  { value: 'kuwaiti', label: 'Kuwaiti' },
  { value: 'kyrgyz', label: 'Kyrgyz' },
  { value: 'laotian', label: 'Laotian' },
  { value: 'latvian', label: 'Latvian' },
  { value: 'lebanese', label: 'Lebanese' },
  { value: 'liberian', label: 'Liberian' },
  { value: 'libyan', label: 'Libyan' },
  { value: 'liechtensteiner', label: 'Liechtensteiner' },
  { value: 'lithuanian', label: 'Lithuanian' },
  { value: 'luxembourger', label: 'Luxembourger' },
  { value: 'macedonian', label: 'Macedonian' },
  { value: 'malagasy', label: 'Malagasy' },
  { value: 'malawian', label: 'Malawian' },
  { value: 'malaysian', label: 'Malaysian' },
  { value: 'maldivan', label: 'Maldivan' },
  { value: 'malian', label: 'Malian' },
  { value: 'maltese', label: 'Maltese' },
  { value: 'marshallese', label: 'Marshallese' },
  { value: 'mauritanian', label: 'Mauritanian' },
  { value: 'mauritian', label: 'Mauritian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'micronesian', label: 'Micronesian' },
  { value: 'moldovan', label: 'Moldovan' },
  { value: 'monacan', label: 'Monacan' },
  { value: 'mongolian', label: 'Mongolian' },
  { value: 'moroccan', label: 'Moroccan' },
  { value: 'mosotho', label: 'Mosotho' },
  { value: 'motswana', label: 'Motswana' },
  { value: 'mozambican', label: 'Mozambican' },
  { value: 'namibian', label: 'Namibian' },
  { value: 'nauruan', label: 'Nauruan' },
  { value: 'nepalese', label: 'Nepalese' },
  { value: 'new zealander', label: 'New Zealander' },
  { value: 'ni-vanuatu', label: 'Ni-Vanuatu' },
  { value: 'nicaraguan', label: 'Nicaraguan' },
  { value: 'nigerian', label: 'Nigerian' },
  { value: 'nigerien', label: 'Nigerien' },
  { value: 'north korean', label: 'North Korean' },
  { value: 'northern irish', label: 'Northern Irish' },
  { value: 'norwegian', label: 'Norwegian' },
  { value: 'omani', label: 'Omani' },
  { value: 'pakistani', label: 'Pakistani' },
  { value: 'palauan', label: 'Palauan' },
  { value: 'panamanian', label: 'Panamanian' },
  { value: 'papua new guinean', label: 'Papua New Guinean' },
  { value: 'paraguayan', label: 'Paraguayan' },
  { value: 'peruvian', label: 'Peruvian' },
  { value: 'polish', label: 'Polish' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'qatari', label: 'Qatari' },
  { value: 'romanian', label: 'Romanian' },
  { value: 'russian', label: 'Russian' },
  { value: 'rwandan', label: 'Rwandan' },
  { value: 'saint lucian', label: 'Saint Lucian' },
  { value: 'salvadoran', label: 'Salvadoran' },
  { value: 'samoan', label: 'Samoan' },
  { value: 'san marinese', label: 'San Marinese' },
  { value: 'sao tomean', label: 'Sao Tomean' },
  { value: 'saudi', label: 'Saudi' },
  { value: 'scottish', label: 'Scottish' },
  { value: 'senegalese', label: 'Senegalese' },
  { value: 'serbian', label: 'Serbian' },
  { value: 'seychellois', label: 'Seychellois' },
  { value: 'sierra leonean', label: 'Sierra Leonean' },
  { value: 'singaporean', label: 'Singaporean' },
  { value: 'slovakian', label: 'Slovakian' },
  { value: 'slovenian', label: 'Slovenian' },
  { value: 'solomon islander', label: 'Solomon Islander' },
  { value: 'somali', label: 'Somali' },
  { value: 'south african', label: 'South African' },
  { value: 'south korean', label: 'South Korean' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'sri lankan', label: 'Sri Lankan' },
  { value: 'sudanese', label: 'Sudanese' },
  { value: 'surinamer', label: 'Surinamer' },
  { value: 'swazi', label: 'Swazi' },
  { value: 'swedish', label: 'Swedish' },
  { value: 'swiss', label: 'Swiss' },
  { value: 'syrian', label: 'Syrian' },
  { value: 'taiwanese', label: 'Taiwanese' },
  { value: 'tajik', label: 'Tajik' },
  { value: 'tanzanian', label: 'Tanzanian' },
  { value: 'thai', label: 'Thai' },
  { value: 'togolese', label: 'Togolese' },
  { value: 'tongan', label: 'Tongan' },
  { value: 'trinidadian or tobagonian', label: 'Trinidadian or Tobagonian' },
  { value: 'tunisian', label: 'Tunisian' },
  { value: 'turkish', label: 'Turkish' },
  { value: 'tuvaluan', label: 'Tuvaluan' },
  { value: 'ugandan', label: 'Ugandan' },
  { value: 'ukrainian', label: 'Ukrainian' },
  { value: 'uruguayan', label: 'Uruguayan' },
  { value: 'uzbekistani', label: 'Uzbekistani' },
  { value: 'venezuelan', label: 'Venezuelan' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'welsh', label: 'Welsh' },
  { value: 'yemenite', label: 'Yemenite' },
  { value: 'zambian', label: 'Zambian' },
  { value: 'zimbabwean', label: 'Zimbabwean' }
]

// Add religion options
const religionOptions = [
  { value: '', label: 'Select religion' },
  { value: 'christianity', label: 'Christianity' },
  { value: 'islam', label: 'Islam' },
  { value: 'hinduism', label: 'Hinduism' },
  { value: 'buddhism', label: 'Buddhism' },
  { value: 'judaism', label: 'Judaism' },
  { value: 'sikhism', label: 'Sikhism' },
  { value: 'taoism', label: 'Taoism' },
  { value: 'confucianism', label: 'Confucianism' },
  { value: 'shinto', label: 'Shinto' },
  { value: 'jainism', label: 'Jainism' },
  { value: 'zoroastrianism', label: 'Zoroastrianism' },
  { value: 'bahai', label: 'Bahai' },
  { value: 'other', label: 'Other' }
]

const classes = ref<{ class_id: string, class_name: string }[]>([])
const isLoadingClasses = ref(false)

// Add relationshipOptions after genderOptions
const relationshipOptions = [
  { value: 'parent', label: 'Parent' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'aunt', label: 'Aunt' },
  { value: 'uncle', label: 'Uncle' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'other', label: 'Other' }
]

// Fetch users from Supabase
const fetchUsers = async () => {
  isLoading.value = true
  try {
    // Get the school_id based on user role
    const schoolId = ['admin', 'registrar'].includes(userRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId;

    // For superadmin, only fetch users if a school is selected
    if (userRole.value === 'superadmin' && !schoolId) {
      users.value = []
      isLoading.value = false
      return
    }

    // For registrar, always use their assigned school_id
    const effectiveSchoolId = ['admin', 'registrar'].includes(currentUserRole.value || '')
      ? authStore.userRole?.school_id
      : schoolId;

    const { users: authUsers } = await getUsersWithRoles(
      currentUserRole.value ?? undefined,
      effectiveSchoolId // Always pass schoolId for filtering
    )

    // Transform the auth users into our User interface format
    users.value = authUsers.map(user => ({
      id: user.id,
      email: user.email || '',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at || null,
      role: user.custom_role || 'user',
      status: user.confirmed_at ? 'active' : 'pending',
      username: user.username || '',
      identification: user.identification || null,
      dob: user.dob || null,
      age: typeof user.age === 'number' ? user.age : null,
      gender: user.gender || null,
      class_id: user.class_id || null,
      class_name: user.class_name || null,
      nationality: user.nationality || null,
      religion: user.religion || null,
      family_name: user.family_name || null,
      family_relationship: user.family_relationship || null,
      family_email: user.family_email || null,
      address: user.address || null,
      emergency_contact: user.emergency_contact || null,
      school_id: user.school_id || null
    }))
  } catch (error: any) {
    console.error('Error fetching users:', error)
    if (error.message?.includes('Missing required Supabase environment variables')) {
      toast.error('Configuration error: Missing Supabase credentials')
    } else {
      toast.error(error.message || 'Failed to fetch users')
    }
  } finally {
    isLoading.value = false
  }
}

// Fetch classes for class_id dropdown
const fetchClasses = async () => {
  isLoadingClasses.value = true
  try {
    // Get the school_id based on user role
    const schoolId = userRole.value === 'admin'
      ? authStore.userRole?.school_id
      : authStore.getSelectedSchoolId;
    
    // Fetch classes with the school ID
    classes.value = await getClasses(schoolId || undefined)
    console.log('Fetched classes:', classes.value)
  } catch (error) {
    console.error('Error fetching classes:', error)
    toast.error('Failed to fetch classes')
  } finally {
    isLoadingClasses.value = false
  }
}

// Utility functions
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

const getRoleBadgeClass = (role: string) => {
  const classes = {
    superadmin: 'bg-danger',
    admin: 'bg-primary',
    teacher: 'bg-success',
    student: 'bg-info',
    parent: 'bg-warning',
    accountant: 'bg-secondary',
    registrar: 'bg-dark',
    user: 'bg-secondary'
  }
  return `badge ${classes[role as keyof typeof classes] || 'bg-secondary'}`
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    active: 'bg-success',
    inactive: 'bg-danger',
    pending: 'bg-warning'
  }
  return `badge ${classes[status as keyof typeof classes] || 'bg-secondary'}`
}

// Actions
const handleSearch = () => {
  currentPage.value = 1 // Reset to first page when searching
}

const resetFilters = () => {
  searchQuery.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
  currentPage.value = 1
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedUsers.value = filteredUsers.value.map(user => user.id)
  } else {
    selectedUsers.value = []
  }
}

const clearSelection = () => {
  selectedUsers.value = []
  selectAll.value = false
}

// Pagination methods
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const goToPage = (page: number) => {
  currentPage.value = page
}

// CRUD Operations
const openAddUserModal = () => {
  showAddUserModal.value = true
}

const closeAddUserModal = () => {
  showAddUserModal.value = false
  addUserForm.value = { 
    email: '', 
    password: '', 
    username: '', 
    role: '',
    identification: '',
    dob: '',
    age: '',
    gender: '',
    class_id: '',
    nationality: '',
    religion: ''
  }
}

const handleAddUser = async () => {
  addUserLoading.value = true
  try {
    // Get the school_id based on user role
    const schoolId = userRole.value === 'admin' 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId;

    // Only include school_id for non-superadmin roles
    const schoolIdToAdd = addUserForm.value.role === 'superadmin' ? null : schoolId;

    if (!schoolIdToAdd && addUserForm.value.role !== 'superadmin') {
      throw new Error('No school ID found. Please select a school first.');
    }

    await addUserWithRole({
      email: addUserForm.value.email,
      username: addUserForm.value.username,
      role: addUserForm.value.role,
      identification: addUserForm.value.identification,
      dob: addUserForm.value.dob,
      age: addUserForm.value.age ? Number(addUserForm.value.age) : undefined,
      gender: addUserForm.value.gender,
      class_id: addUserForm.value.class_id,
      nationality: addUserForm.value.nationality,
      religion: addUserForm.value.religion,
      school_id: schoolIdToAdd // Add school_id to the user creation
    })
    toast.success('User added successfully!')
    closeAddUserModal()
    await fetchUsers()
  } catch (error: any) {
    console.error('Error adding user:', error)
    toast.error(error.message || 'Failed to add user')
  } finally {
    addUserLoading.value = false
  }
}

const openEditUserModal = (user: User) => {
  console.log('Opening edit modal for user:', user) // Debug log
  console.log('User data from API:', {
    dob: user.dob,
    age: user.age,
    gender: user.gender,
    class_id: user.class_id,
    nationality: user.nationality,
    religion: user.religion,
    family_name: user.family_name,
    family_relationship: user.family_relationship,
    family_email: user.family_email,
    address: user.address,
    emergency_contact: user.emergency_contact
  }) // Debug log
  editUserForm.value = {
    email: user.email,
    username: user.username || '',
    role: user.role,
    identification: user.identification || '',
    dob: user.dob || '',
    age: user.age?.toString() || '',
    gender: user.gender || '',
    class_id: user.class_id || '',
    nationality: user.nationality || '',
    religion: user.religion || '',
    family_name: user.family_name || '',
    family_relationship: user.family_relationship || '',
    family_email: user.family_email || '',
    address: user.address || '',
    emergency_contact: user.emergency_contact || ''
  }
  console.log('Edit form data:', editUserForm.value) // Debug log
  showEditUserModal.value = true
}

const closeEditUserModal = () => {
  showEditUserModal.value = false
  editUserForm.value = { 
    email: '', 
    username: '', 
    role: '',
    identification: '',
    dob: '',
    age: '',
    gender: '',
    class_id: '',
    nationality: '',
    religion: '',
    family_name: '',
    family_relationship: '',
    family_email: '',
    address: '',
    emergency_contact: ''
  }
  
  // Reset search values
  genderSearch.value = ''
  nationalitySearch.value = ''
  religionSearch.value = ''
  relationshipSearch.value = ''
  
  // Close all dropdowns
  showGenderDropdown.value = false
  showNationalityDropdown.value = false
  showReligionDropdown.value = false
  showRelationshipDropdown.value = false
}

const handleEditUser = async () => {
  editUserLoading.value = true
  try {
    // Get the current user being edited from the editUserForm
    const email = editUserForm.value.email
    const user = users.value.find(u => u.email === email)
    
    if (!user) {
      throw new Error('User not found')
    }
    
    // Store original user data for audit logging
    const originalUserData = { ...user }
    
    // Prepare update data
    const updateData = {
      email: editUserForm.value.email,
      username: editUserForm.value.username,
      role: editUserForm.value.role,
      identification: editUserForm.value.identification,
      dob: editUserForm.value.dob,
      age: editUserForm.value.age ? Number(editUserForm.value.age) : undefined,
      gender: editUserForm.value.gender,
      class_id: editUserForm.value.class_id,
      nationality: editUserForm.value.nationality,
      religion: editUserForm.value.religion,
      family_name: editUserForm.value.family_name,
      family_relationship: editUserForm.value.family_relationship,
      family_email: editUserForm.value.family_email,
      address: editUserForm.value.address,
      emergency_contact: editUserForm.value.emergency_contact
    }
    
    await updateUserWithRole(updateData)
    
    // Log the activity to audit_logs
    await logActivity(
      'update',
      'users',
      originalUserData.id,
      originalUserData,
      { ...originalUserData, ...updateData }
    )
    
    toast.success('User updated successfully!')
    closeEditUserModal()
    fetchUsers()
  } catch (error: any) {
    toast.error(error.message || 'Failed to update user')
  } finally {
    editUserLoading.value = false
  }
}

const openDeleteUserModal = (user: User) => {
  deleteUserTarget.value = user
  showDeleteUserModal.value = true
}

const closeDeleteUserModal = () => {
  showDeleteUserModal.value = false
  deleteUserTarget.value = null
}

const confirmDeleteUser = async () => {
  if (!deleteUserTarget.value) return
  deleteUserLoading.value = true
  try {
    // Store user data before deletion for audit logging
    const userData = { ...deleteUserTarget.value }
    
    await deleteUserApi(deleteUserTarget.value.id)
    
    // Log the activity to audit_logs
    await logActivity(
      'delete',
      'users',
      userData.id,
      userData,
      null
    )
    
    toast.success('User deleted successfully!')
    closeDeleteUserModal()
    fetchUsers()
  } catch (error: any) {
    toast.error(error.message || 'Failed to delete user')
  } finally {
    deleteUserLoading.value = false
  }
}

const handleRoleChange = () => {
  // Fetch classes when role is changed to teacher or student
  if (editUserForm.value.role === 'teacher' || editUserForm.value.role === 'student') {
    fetchClasses()
  }
}

const openViewUserModal = (user: User) => {
  viewUserTarget.value = user
  showViewUserModal.value = true
  
  // Set default tab to 'basic'
  activeUserDetailsTab.value = 'basic'
  
  // If additional tab is selected but user isn't student or teacher, reset to basic
  if (activeUserDetailsTab.value === 'additional' && !['student', 'teacher'].includes(user.role)) {
    activeUserDetailsTab.value = 'basic'
  }
  
  // If family tab is selected but user isn't student, reset to basic
  if (activeUserDetailsTab.value === 'family' && user.role !== 'student') {
    activeUserDetailsTab.value = 'basic'
  }
}

const closeViewUserModal = () => {
  showViewUserModal.value = false
  viewUserTarget.value = null
}

// Reset password modal functions
const openResetPasswordModal = (user: User) => {
  resetPasswordTarget.value = user
  showResetPasswordModal.value = true
}

const closeResetPasswordModal = () => {
  showResetPasswordModal.value = false
  resetPasswordTarget.value = null
}

const confirmResetPassword = async () => {
  if (!resetPasswordTarget.value) return
  resetPasswordLoading.value = true
  try {
    await resetUserPassword(resetPasswordTarget.value.id)
    toast.success('Password reset successfully! New password is: 12345678')
    closeResetPasswordModal()
  } catch (error: any) {
    toast.error(error.message || 'Failed to reset password')
  } finally {
    resetPasswordLoading.value = false
  }
}

// Add the handler function for school selection
const handleSchoolSelected = async (schoolId: string) => {
  if (userRole.value === 'superadmin') {
    await fetchUsers() // Refetch users when school is selected
    await fetchClasses() // Also fetch classes for the selected school
  }
}

// Add watch for selected school changes
watch(
  () => authStore.getSelectedSchoolId,
  async (newSchoolId) => {
    if (userRole.value === 'superadmin') {
      await fetchUsers() // Refetch users when selected school changes
      await fetchClasses() // Also refetch classes when school changes
    }
  }
)

// Initialize
onMounted(() => {
  fetchUsers()
  fetchClasses()
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.custom-select-container')) {
      showGenderDropdown.value = false
      showNationalityDropdown.value = false
      showReligionDropdown.value = false
      showRelationshipDropdown.value = false
    }
  })
})

// Add the calculateAgeForEdit function
const calculateAgeForEdit = () => {
  if (editUserForm.value.dob) {
    const birthDate = new Date(editUserForm.value.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    editUserForm.value.age = String(age);
  }
}

const genderSearch = ref('')
const showGenderDropdown = ref(false)
const filteredGenders = computed(() => {
  if (!genderSearch.value) return genderOptions.slice(1) // Skip the "Select gender" option
  const search = genderSearch.value.toLowerCase()
  return genderOptions
    .filter(option => option.value && option.label.toLowerCase().includes(search))
})

const handleGenderSearch = () => {
  showGenderDropdown.value = true
}

const selectGender = (option: { value: string, label: string }) => {
  editUserForm.value.gender = option.value
  genderSearch.value = option.label
  showGenderDropdown.value = false
}

const nationalitySearch = ref('')
const showNationalityDropdown = ref(false)
const filteredNationalities = computed(() => {
  if (!nationalitySearch.value) return nationalityOptions.slice(1) // Skip the "Select nationality" option
  const search = nationalitySearch.value.toLowerCase()
  return nationalityOptions
    .filter(option => option.value && option.label.toLowerCase().includes(search))
})

const handleNationalitySearch = () => {
  showNationalityDropdown.value = true
}

const selectNationality = (option: { value: string, label: string }) => {
  editUserForm.value.nationality = option.value
  nationalitySearch.value = option.label
  showNationalityDropdown.value = false
}

const religionSearch = ref('')
const showReligionDropdown = ref(false)
const filteredReligions = computed(() => {
  if (!religionSearch.value) return religionOptions.slice(1) // Skip the "Select religion" option
  const search = religionSearch.value.toLowerCase()
  return religionOptions
    .filter(option => option.value && option.label.toLowerCase().includes(search))
})

const handleReligionSearch = () => {
  showReligionDropdown.value = true
}

const selectReligion = (option: { value: string, label: string }) => {
  editUserForm.value.religion = option.value
  religionSearch.value = option.label
  showReligionDropdown.value = false
}

// Update search values when edit form is populated
watch(() => showEditUserModal.value, (isVisible) => {
  if (isVisible) {
    if (editUserForm.value.gender) {
      genderSearch.value = genderOptions.find(g => g.value === editUserForm.value.gender)?.label || ''
    }
    if (editUserForm.value.nationality) {
      nationalitySearch.value = nationalityOptions.find(n => n.value === editUserForm.value.nationality)?.label || ''
    }
    if (editUserForm.value.religion) {
      religionSearch.value = religionOptions.find(r => r.value === editUserForm.value.religion)?.label || ''
    }
    if (editUserForm.value.family_relationship) {
      relationshipSearch.value = relationshipOptions.find(r => r.value === editUserForm.value.family_relationship)?.label || ''
    }
  } else {
    // Reset search values when modal is closed
    genderSearch.value = ''
    nationalitySearch.value = ''
    religionSearch.value = ''
    relationshipSearch.value = ''
    
    // Reset dropdowns
    showGenderDropdown.value = false
    showNationalityDropdown.value = false
    showReligionDropdown.value = false
    showRelationshipDropdown.value = false
  }
})

const relationshipSearch = ref('')
const showRelationshipDropdown = ref(false)
const filteredRelationships = computed(() => {
  if (!relationshipSearch.value) return relationshipOptions.slice(1) // Skip the "Select relationship" option
  const search = relationshipSearch.value.toLowerCase()
  return relationshipOptions
    .filter(option => option.value && option.label.toLowerCase().includes(search))
})

const handleRelationshipSearch = () => {
  showRelationshipDropdown.value = true
}

const selectRelationship = (option: { value: string, label: string }) => {
  editUserForm.value.family_relationship = option.value
  relationshipSearch.value = option.label
  showRelationshipDropdown.value = false
}
</script>

<style scoped lang="scss">
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.card {
  max-width: 100%;
  overflow-x: auto;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  transform: none !important;
  transition: none !important;

  .card-body {
    padding: 1.5rem;
  }

  &:hover {
    transform: none !important;
    box-shadow: none;
  }
}

.search-box {
  position: relative;
  
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
  }
  
  .search-input {
    padding-left: 35px;
  }
}

.user-avatar {
  img {
    object-fit: cover;
  }
}

.bulk-actions-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1rem;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  
  .container {
    max-width: 1280px;
    margin: 0 auto;
  }
  
  &.show {
    transform: translateY(0);
  }
}

.table {
  margin-bottom: 0;
  
  tbody tr {
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: #f8f9fa !important;
      cursor: pointer;
    }
  }
  
  tr.selected {
    background-color: #f8f9fa;
  }
  
  th {
    font-weight: 600;
    color: #2c3e50;
    border-bottom: 2px solid #dee2e6;
  }

  td {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-bottom: 1px solid #dee2e6;
  }
}

.badge {
  padding: 0.5em 0.75em;
  font-weight: 500;
  text-transform: capitalize;
}

.pagination {
  .page-link {
    color: #42b883;
    
    &:hover {
      color: darken(#42b883, 10%);
    }
  }
  
  .active .page-link {
    background-color: #42b883;
    border-color: #42b883;
    color: white;
  }
}

@media (max-width: 1400px) {
  .container {
    max-width: 1140px;
  }
}

@media (max-width: 1200px) {
  .container {
    max-width: 960px;
  }
}

@media (max-width: 992px) {
  .container {
    max-width: 720px;
  }
}

@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

// Modern Modal Styles
.modern-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 2rem; // Increased padding for better spacing
  overflow-y: auto; // Added to handle very tall modals
}

.modern-modal-card {
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  position: relative;
  width: 100%;
  max-width: 800px;
  height: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  overflow: visible;

  &.expanded {
    max-width: 1200px;
  }

  &.modal-sm {
    max-width: 360px;
    padding: 1.75rem;
    
    .modern-modal-header {
      margin-bottom: 1.25rem;
      
      h2 {
        font-size: 1.2rem;
      }
      
      p {
        font-size: 0.9rem;
        margin-top: 0.25rem;
      }
    }
    
    .delete-user-email {
      font-size: 1rem;
      margin: 0.75rem 0;
      word-break: break-all;
    }
    
    .text-muted.small {
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
    }
    
    .btn {
      padding: 0.4rem 0.75rem;
      font-size: 0.875rem;
    }
    
    .modern-modal-close {
      top: 1rem;
      right: 1rem;
      font-size: 1.1rem;
    }
  }

  .modern-modal-close {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    background: none;
    border: none;
    color: #64748b;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
      background: #f1f5f9;
      color: #1e293b;
    }
  }

  .modern-modal-header {
    margin-bottom: 2rem;

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    p {
      color: #64748b;
      margin-top: 0.5rem;
    }
  }
}

.modern-modal-form {
  .form-section {
    background: #f8fafc;
    border-radius: 1rem;
    padding: 1.5rem;
    height: auto;
    margin-bottom: 1rem;
    overflow: visible; // Added to ensure dropdowns are visible
  }
}

// Add smooth transition for width changes
.transition-width {
  transition: width 0.3s ease-in-out;
}

@keyframes modal-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(30px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modern-modal-close {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 10;
  &:hover {
    color: #42b883;
  }
}

.modern-modal-header {
  margin-bottom: 1.5rem;
  text-align: center;
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    color: #2c3e50;
  }
  p {
    font-size: 1rem;
    color: #6c757d;
  }
}

.modern-modal-form {
  .form-section {
    background: #f8f9fa;
    border-radius: 0.75rem;
    padding: 2rem;
    margin-bottom: 1.5rem;
    height: 100%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

    &:hover {
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    color: #2c3e50;
    font-weight: 600;
    margin-bottom: 1.25rem;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    padding-bottom: 0.75rem;
    
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 40px;
      height: 3px;
      background: #42b883;
      border-radius: 3px;
    }
  }

  .form-control,
  .form-select {
    height: 3.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    background-color: #fff;
    transition: all 0.2s ease;
    font-size: 0.95rem;

    &:disabled {
      background-color: #f1f5f9;
      cursor: not-allowed;
      opacity: 0.8;
    }

    &::placeholder {
      color: #94a3b8;
    }

    &:focus {
      border-color: #42b883;
      box-shadow: 0 0 0 0.2rem rgba(66, 184, 131, 0.15);
    }
  }

  .form-select {
    color: #1e293b;
    
    option:first-child {
      color: #94a3b8;
    }
  }

  .btn {
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    border-radius: 0.5rem;
    transition: all 0.2s ease;

    &.btn-primary {
      background: #42b883;
      border: none;

      &:hover {
        background: #369f6b;
      }

      &:disabled {
        background: #a8e6c1;
      }
    }

    &.btn-outline-secondary {
      border-color: #e2e8f0;
      color: #64748b;

      &:hover {
        background: #f8f9fa;
        border-color: #cbd5e1;
        color: #475569;
      }
    }
  }
}

// Modal fade/scale animation
.modern-modal-fade-enter-active,
.modern-modal-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.modern-modal-fade-enter-from,
.modern-modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.skeleton {
  display: inline-block;
  height: 1.2em;
  background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.2s ease-in-out infinite;
  border-radius: 0.4em;
}
.skeleton-checkbox {
  width: 1.2em;
  height: 1.2em;
  border-radius: 0.25em;
}
.skeleton-badge {
  width: 4em;
  height: 1.2em;
}
.skeleton-text {
  width: 10em;
  height: 1.2em;
}
.skeleton-text.short {
  width: 6em;
}
.skeleton-actions {
  width: 3em;
  height: 1.2em;
}
@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.delete-user-email {
  text-align: center;
  font-size: 1.1rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 850px) {
  .modern-modal-card {
    max-width: 95%;
    padding: 2rem 1.5rem 1.5rem 1.5rem;
  }
}

.user-details-section {
  background: #f8f9fa;
  border-radius: 0.75rem;
  padding: 1.2rem 1.2rem 0.7rem 1.2rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 4px rgba(30,41,59,0.04);
}
.user-details-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}
.user-details-label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.97rem;
  margin-bottom: 0.25rem;
  letter-spacing: 0.2px;
}
.user-details-value {
  font-size: 1.08rem;
  color: #222f3e;
  font-weight: 500;
  word-break: break-word;
}
.user-status-chip {
  display: inline-block;
  padding: 0.35em 1.1em;
  border-radius: 1em;
  font-size: 0.98em;
  font-weight: 600;
  text-transform: capitalize;
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #d1d5db;
  margin-top: 2px;
}
.user-status-chip.active {
  background: #e9fbe7;
  color: #22c55e;
  border: 1px solid #b6f2c2;
}

.user-profile-header {
  text-align: center;
  padding: 1.5rem 1rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(to right, #f8f9fa, #f1f5f9);
  border-radius: 0.75rem;
  border: 1px solid #eaecef;
}

.user-profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.75rem 0 0.25rem;
  color: #2c3e50;
}

.user-profile-email {
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.user-role-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 auto 0.5rem;
}

.user-profile-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
}

.status-active {
  background: #e6f6e6;
  color: #16a34a;
}

.status-inactive {
  background: #fee2e2;
  color: #dc2626;
}

.status-pending {
  background: #fff7e6;
  color: #d97706;
}

.status-indicator {
  font-size: 0.6rem;
}

.user-details-tabs {
  margin-bottom: 1.5rem;
}

.user-details-tabs-container {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1rem;
}

.user-details-tab-btn {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
  cursor: pointer;
}

.user-details-tab-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.user-details-tab-btn.active {
  background: #eef5f1;
  color: #42b883;
  font-weight: 600;
}

.user-details-tab-btn i {
  margin-right: 0.4rem;
}

.user-details-tab-content {
  margin-top: 1.5rem;
}

.user-details-tab-pane {
  display: none;
}

.user-details-tab-pane.active {
  display: block;
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.info-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  height: 100%;
  transition: all 0.2s;
}

.info-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transform: translateY(-2px);
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: #eef5f1;
  color: #42b883;
  font-size: 1rem;
}

.info-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.form-section {
  background: #fafafa !important;
}

.user-details-label {
  color: #64748b;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.user-details-value {
  color: #1e293b;
  font-weight: 600;
  font-size: 1rem;
  word-break: break-word;
}

@media (max-width: 768px) {
  .user-details-tabs-container {
    flex-wrap: wrap;
  }
  
  .info-card {
    padding: 0.75rem;
  }
}

.row.expanded {
  animation: row-expand 0.65s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes row-expand {
  from {
    opacity: 0.95;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// Actions container for better display of action buttons
.actions-container {
  min-width: 200px;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap; // Prevent wrapping of buttons
}

// Button in actions container should have fixed width for consistency
.actions-container .btn {
  width: 38px;
  height: 32px;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Fix for actions column in the table
td:last-child {
  min-width: 220px;
}

// Slide fade transition for the right panel
.slide-fade-enter-active {
  transition: all 0.65s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(40px);
  opacity: 0;
}

// Row animation
.row.expanded {
  animation: row-expand 0.65s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes row-expand {
  from {
    opacity: 0.95;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// Modern modal media queries
@media (max-width: 1200px) {
  .modern-modal-card {
    max-width: 95%;
    width: 95%;
    
    &.expanded {
      max-width: 95%;
    }
  }
}

@media (max-width: 768px) {
  .modern-modal-card {
    padding: 2rem 1.5rem 1.5rem 1.5rem;
  }
  
  .row > [class*="col-"] {
    margin-bottom: 1rem;
  }
  
  .transition-width {
    width: 100% !important;
  }
}

.transition-width {
  transition: all 0.65s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.custom-select-container {
  position: relative;
}

.custom-select-dropdown {
  position: absolute;
  top: calc(100% + 5px); // Added a small gap
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1060; // Increased z-index to appear above modal
  max-height: 200px; // Reduced max-height
  overflow-y: auto;
  animation: dropdown-fade-in 0.2s ease;
}

@keyframes dropdown-fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-select-options {
  padding: 0.5rem 0;
}

.custom-select-option {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
    color: #42b883;
  }
  
  &.selected {
    background: #42b883;
    color: white;
    
    &:hover {
      background: #3aa876;
    }
  }
}

.no-results {
  padding: 0.75rem 1rem;
  color: #64748b;
  text-align: center;
  font-style: italic;
}

/* Custom scrollbar for the dropdown */
.custom-select-dropdown {
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
    
    &:hover {
      background: #a8a8a8;
    }
  }
}

.changes-summary-cell {
  max-width: 300px;
  
  .changes-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #4b5563;
    align-items: center;
  }
  
  .changed-field {
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    color: #6b7280;
    border: 1px solid #e5e7eb;
    white-space: nowrap;
  }
  
  .show-more-btn {
    background: #e5e7eb;
    color: #4b5563;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    
    &:hover {
      background: #d1d5db;
      color: #374151;
    }
  }
}

.modern-modal-card {
  &.modal-sm {
    max-width: 360px;
    padding: 1.75rem;
    
    .modern-modal-header {
      margin-bottom: 1.5rem;
      
      h2 {
        font-size: 1.3rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }
      
      p {
        font-size: 0.9rem;
        color: #64748b;
      }
    }
  }
}

.modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 1.5rem;
  
  &.modal-icon-danger {
    background-color: #fee2e2;
    color: #dc2626;
  }
  
  &.modal-icon-warning {
    background-color: #fef3c7;
    color: #d97706;
  }
}

.modal-body {
  padding: 1rem 0;
}

.user-info-box {
  background: #f8fafc;
  border-radius: 0.75rem;
  padding: 1rem;
  margin: 0.5rem 0;
  border: 1px solid #e2e8f0;
  
  .user-email {
    font-weight: 500;
    color: #1e293b;
    word-break: break-all;
    margin-bottom: 0.5rem;
  }
  
  .user-role {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 500;
  }
}

.password-info {
  background: #fffbeb;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px dashed #fbbf24;
  
  .password-label {
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }
  
  .password-value {
    font-family: monospace;
    font-size: 1.25rem;
    font-weight: 600;
    color: #b45309;
  }
}

.modal-footer {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  
  .btn {
    padding: 0.5rem 1.25rem;
    font-weight: 500;
    border-radius: 0.5rem;
    
    &.btn-light {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #64748b;
      
      &:hover {
        background: #e2e8f0;
        color: #475569;
      }
    }
    
    &.btn-danger {
      background: #dc2626;
      border: none;
      color: white;
      
      &:hover {
        background: #b91c1c;
      }
      
      &:disabled {
        background: #fca5a5;
      }
    }
    
    &.btn-warning {
      background: #d97706;
      border: none;
      color: white;
      
      &:hover {
        background: #b45309;
      }
      
      &:disabled {
        background: #fcd34d;
      }
    }
  }
}

// Animation for modal appearance
.modern-modal-fade-enter-active,
.modern-modal-fade-leave-active {
  transition: all 0.3s ease;
  
  .modern-modal-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.modern-modal-fade-enter-from,
.modern-modal-fade-leave-to {
  opacity: 0;
  
  .modern-modal-card {
    transform: scale(0.95) translateY(10px);
  }
}

.modern-modal-fade-enter-to,
.modern-modal-fade-leave-from {
  opacity: 1;
  
  .modern-modal-card {
    transform: scale(1) translateY(0);
  }
}
</style> 