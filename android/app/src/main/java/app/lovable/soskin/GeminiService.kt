package app.lovable.soskin

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * GeminiService: المسؤول الوحيد عن التواصل مع Gemini API في مشروع S.O.SKIN
 */
class GeminiService(private val apiKey: String) {

    // المتغير model_id لسهولة الترقية مستقبلاً لـ Gemini Pro
    private var modelId: String = "gemini-1.5-flash"

    fun setModel(newModelId: String) {
        this.modelId = newModelId
    }

    /**
     * generateResponse: دالة توليد الرد مع معالجة حالة الانتظار
     */
    suspend fun generateResponse(prompt: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val url = URL("https://generativelanguage.googleapis.com/v1beta/models/$modelId:generateContent?key=$apiKey")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            conn.doOutput = true

            val requestBody = JSONObject().apply {
                put("contents", JSONObject().apply {
                    put("parts", JSONObject().apply {
                        put("text", prompt)
                    })
                })
            }

            conn.outputStream.use { os ->
                os.write(requestBody.toString().toByteArray())
            }

            if (conn.responseCode == 200) {
                val response = conn.inputStream.bufferedReader().readText()
                val jsonResponse = JSONObject(response)
                val text = jsonResponse.getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text")
                Result.success(text)
            } else {
                val error = conn.errorStream.bufferedReader().readText()
                Log.e("GeminiService", "API Error: $error")
                Result.failure(Exception("Failed to get response: ${conn.responseCode}"))
            }
        } catch (e: Exception) {
            Log.e("GeminiService", "Connection Error", e)
            Result.failure(e)
        }
    }
}
