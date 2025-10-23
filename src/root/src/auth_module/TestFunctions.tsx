export interface TestResponse {
    success: boolean;
    message: string;
    error?: string;
    data?: any; // Sostituisci "any" con il tipo appropriato se lo conosci
}

export type TestFunctionType = () => Promise<TestResponse>;

export const testFunction: TestFunctionType = async () => {
    try {
        const response = await fetch('/auth/api/test.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: errorData.message || 'Test API request failed',
                error: errorData.error,
            };
        }

        const data: TestResponse = await response.json();
        return data;
    } catch (error: any) {
        console.error('Test API request error: ', error);
        return {
            success: false,
            message: 'Error during test API request',
            error: error.message || 'Unknown error',
        };
    }
};
