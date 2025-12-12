import axios from 'axios';

const API_URL = 'https://impact-bug-getting-albuquerque.trycloudflare.com/api';
const BASE_URL = API_URL.replace('/api', '');

export const API = {
  // ==========================================
  // 👶 AGE GROUPS
  // ==========================================
  getAgeGroups: async () => {
    const res = await axios.get(`${API_URL}/age-groups`);
    return res.data.map(item => ({
      id: item.id,
      ageValue: item.age_value,
      label: item.label,
      desc: item.description,
      color: item.color,
      icon: item.icon_name,
      sortOrder: item.sort_order ?? 0,
    }));
  },

  // data = { ageValue, label, desc, color, icon, sortOrder }
  addAgeGroup: async (data) => {
    await axios.post(`${API_URL}/age-groups`, data);
  },

  updateAgeGroup: async (id, data) => {
    await axios.put(`${API_URL}/age-groups/${id}`, data);
  },

  deleteAgeGroup: async (id) => {
    await axios.delete(`${API_URL}/age-groups/${id}`);
  },

  // ==========================================
  // 📄 WORKSHEETS
  // ==========================================
  addBulkWorksheets: async (ageRanges, category, fileList) => {
    const formData = new FormData();
    formData.append('ageRange', ageRanges.join(','));
    formData.append('category', category);

    for (let i = 0; i < fileList.length; i++) {
      formData.append('files', fileList[i]);
    }

    await axios.post(`${API_URL}/worksheets/bulk`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  getWorksheets: async () => {
    const res = await axios.get(`${API_URL}/worksheets`);

    return res.data.map(item => {
      let img = item.image_url;
      let pdf = item.pdf_url;

      if (img && !img.startsWith('http')) {
        img = `${BASE_URL}${img}`;
      }
      if (pdf && !pdf.startsWith('http')) {
        pdf = `${BASE_URL}${pdf}`;
      }

      return {
        id: item.id,
        title: item.title,
        ageRange: item.age_range,
        category: item.category,
        imageUrl: img,
        pdfUrl: pdf
      };
    });
  },

  addWorksheet: async (formData) => {
    await axios.post(`${API_URL}/worksheets`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateWorksheet: async (id, formData) => {
    await axios.put(`${API_URL}/worksheets/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteWorksheet: async (id) => {
    await axios.delete(`${API_URL}/worksheets/${id}`);
  },

  // ==========================================
  // 📚 CATEGORIES (หมวดวิชา)
  // ==========================================
  getCategories: async () => {
    const res = await axios.get(`${API_URL}/categories`);
    return res.data.map(c => ({
      id: c.id,
      name: c.name,
      ageGroup: c.age_group,
      sortOrder: c.sort_order
    }));
  },

  addCategory: async (name, ageGroup, sortOrder = 0) => {
    await axios.post(`${API_URL}/categories`, {
      name,
      age_group: ageGroup,
      sort_order: sortOrder
    });
  },

  deleteCategory: async (id) => {
    await axios.delete(`${API_URL}/categories/${id}`);
  }
};
