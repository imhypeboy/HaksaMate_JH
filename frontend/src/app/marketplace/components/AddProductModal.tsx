"use client"

import type React from "react"
import { useState } from "react"
import { X, Plus } from "lucide-react"
import { CATEGORIES } from "../constants"
import { useMarketplace } from "../hooks/useMarketplace"
import { useAuth } from "@/hooks/useAuth"

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  isDarkMode?: boolean
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSuccess, isDarkMode = false }) => {
  const { user } = useAuth()
  const { createProduct } = useMarketplace()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    meetLocation: "",
  })
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      setImages((prev) => [...prev, ...newImages].slice(0, 5)) // 최대 5개
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert("로그인이 필요합니다.")
      return
    }

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()

      // 상품 정보를 JSON으로 추가
      const itemData = {
        title: formData.title,
        description: formData.description,
        price: Number.parseInt(formData.price),
        category: formData.category,
        meetLocation: formData.meetLocation,
        sellerId: user.id,
      }

      formDataToSend.append(
        "item",
        new Blob([JSON.stringify(itemData)], {
          type: "application/json",
        }),
      )

      // 이미지 파일들 추가
      images.forEach((image, index) => {
        formDataToSend.append("images", image)
      })

      await createProduct(formDataToSend)

      alert("상품이 성공적으로 등록되었습니다!")
      onSuccess()

      // 폼 초기화
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "",
        meetLocation: "",
      })
      setImages([])
    } catch (error) {
      console.error("상품 등록 실패:", error)
      alert("상품 등록에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl ${
          isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
        } shadow-2xl`}
      >
        {/* 헤더 */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-inherit rounded-t-3xl">
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>상품 등록</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            }`}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 이미지 업로드 */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              상품 이미지 (최대 5개)
            </label>
            <div className="grid grid-cols-5 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={URL.createObjectURL(image) || "/placeholder.svg"}
                    alt={`상품 이미지 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label
                  className={`aspect-square rounded-lg border-2 border-dashed cursor-pointer flex items-center justify-center transition-colors ${
                    isDarkMode
                      ? "border-gray-600 hover:border-gray-500 bg-gray-700/50"
                      : "border-gray-300 hover:border-gray-400 bg-gray-50"
                  }`}
                >
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                  <Plus size={24} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                </label>
              )}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              제목 *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="상품 제목을 입력하세요"
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              카테고리 *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:border-blue-400"
                  : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            >
              <option value="">카테고리를 선택하세요</option>
              {CATEGORIES.filter((cat) => cat.id !== "all").map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* 가격 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              가격 *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="가격을 입력하세요"
            />
          </div>

          {/* 거래 위치 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              거래 희망 위치
            </label>
            <input
              type="text"
              name="meetLocation"
              value={formData.meetLocation}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="거래 희망 위치를 입력하세요"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              상품 설명 *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="상품에 대한 자세한 설명을 입력하세요"
            />
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : isDarkMode
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {isSubmitting ? "등록 중..." : "상품 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProductModal
