import React, { useState } from 'react';
import axios from 'axios';
import '../styles/LoginPage.css';
import '../styles/SignupPage.css';
import '../styles/Layout.css';

function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    height: '',
    weight: '',
    age: 0,
    sex: 'M',
  });
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'age' ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/account/v1/signup/', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('회원가입 성공 : ', response.data);
    } catch (error) {
      if (error.response) {
        console.log('회원가입 실패 : ', error.response.data);
      } else {
        console.log('회원가입 실패 : ', error.message);
      }
    }
  };

  //   if (password !== confirmPw) {
  //     setError('비밀번호가 일치하지 않습니다.');
  //     return;
  //   }

  //   try {
  //     const response = await api.post('signup/', {
  //       email,
  //       username,
  //       password,
  //       height: height || null,
  //       weight: weight || null,
  //       age,
  //       sex: gender || null,
  //     });
  //     console.log('✅ 회원가입 성공:', response.data);
  //     setSuccess(true);
  //     setError('');
  //   } catch (err) {
  //     console.error('❌ 회원가입 실패:', err);
  //     setError('회원가입 중 오류가 발생했습니다.');
  //     setSuccess(false);
  //   }
  // };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>사용자명:</label>
        <input type="text" name="username" value={formData.username} onChange={handleChange} required />
      </div>
      <div>
        <label>이메일:</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </div>
      <div>
        <label>비밀번호:</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
      </div>
      <div>
        <label>키:</label>
        <input type="text" name="height" value={formData.height} onChange={handleChange} required />
      </div>
      <div>
        <label>몸무게:</label>
        <input type="text" name="weight" value={formData.weight} onChange={handleChange} required />
      </div>
      <div>
        <label>나이:</label>
        <input type="number" name="age" value={formData.age} onChange={handleChange} required />
      </div>
      <div>
        <label>성별:</label>
        <select name="sex" value={formData.sex} onChange={handleChange} required>
          <option value="M">남성</option>
          <option value="F">여성</option>
        </select>
      </div>
      <button type="submit">회원가입</button>
    </form>
  );
}

//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             {success && <p style={{ color: 'green' }}>회원가입이 완료되었습니다!</p>}

//             <button type="submit" className="login-btn2">
//               Sign Up
//             </button>
//           </form>
//           <div className="signup-link">
//             Already have an account? <Link to="/login">Login</Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
export default SignupPage;
