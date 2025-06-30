"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Plus } from "lucide-react"
import { CATEGORIES } from "../constants"
import { useMarketplace } from "../hooks/useMarketplace"
import type { Product } from "../types"

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product: Product | null
  isDarkMode?: boolean
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
  isDarkMode = false,
}) => {
  const { updateProduct } = useMarketplace()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    meetLocation: "",
    status: "available" as "available" | "reserved" | "sold",
  })
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const statusOptions = [
    { value: "available", label: "판매중", icon: "🟢", description: "구매자를 찾고 있는 상태" },
    { value: "reserved", label: "예약중", icon: "🟡", description: "구매자와 거래 진행 중" },
    { value: "sold", label: "판매완료", icon: "⚫", description: "거래가 완료된 상태" },
  ]

  // 상품 정보로 폼 초기화
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        title: product.title,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        meetLocation: product.location,
        status: product.status,
      })
      setExistingImages(product.images || [])
      setImages([])
      console.log("🔧 EditModal 초기화:", {
        existingImages: product.images?.length || 0,
        status: product.status,
      })
    }
  }, [product, isOpen])

  if (!isOpen || !product) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      const totalImages = existingImages.length + images.length + newImages.length
      if (totalImages > 5) {
        alert("이미지는 최대 5개까지 업로드할 수 있습니다.")
        return
      }
      setImages((prev) => [...prev, ...newImages])
    }
  }

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()

      // 🔧 백엔드 상태 매핑
      const backendStatus = mapFrontendToBackendStatus(formData.status)

      // 상품 정보를 JSON으로 추가
      const itemData = {
        title: formData.title,
        description: formData.description,
        price: Number.parseInt(formData.price),
        category: formData.category,
        meetLocation: formData.meetLocation,
        sellerId: product.sellerId,
        status: backendStatus, // 🔧 백엔드 형식으로 변환된 상태
        itemImages: existingImages, // 🔧 유지할 기존 이미지 목록
      }

      console.log("🔧 전송할 데이터:", {
        ...itemData,
        newImagesCount: images.length,
        existingImagesCount: existingImages.length,
      })

      formDataToSend.append(
        "item",
        new Blob([JSON.stringify(itemData)], {
          type: "application/json",
        }),
      )

      // 새로운 이미지 파일들 추가
      images.forEach((image) => {
        formDataToSend.append("images", image)
      })

      await updateProduct(product.id, formDataToSend)

      alert("상품이 성공적으로 수정되었습니다!")
      onSuccess()

      // 폼 초기화
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "",
        meetLocation: "",
        status: "available",
      })
      setImages([])
      setExistingImages([])
    } catch (error) {
      console.error("상품 수정 실패:", error)
      alert("상품 수정에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 🔧 프론트엔드 상태를 백엔드 상태로 매핑
  const mapFrontendToBackendStatus = (status: string): string => {
    switch (status) {
      case "available":
        return "판매중"
      case "reserved":
        return "예약중"
      case "sold":
        return "거래완료"
      default:
        return "판매중"
    }
  }

  const totalImages = existingImages.length + images.length

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
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>상품 수정</h2>
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
          {/* 이미지 관리 */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              상품 이미지 (최대 5개)
            </label>

            {/* 🔧 현재 이미지 상태 표시 */}
            <div className={`text-sm mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              기존 이미지: {existingImages.length}개 | 새 이미지: {images.length}개 | 총 {totalImages}개
            </div>

            {/* 기존 이미지들 */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className={`text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  기존 이미지 ({existingImages.length}개)
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {existingImages.map((image, index) => (
                    <div
                      key={`existing-${index}`}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`기존 이미지 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        title="기존 이미지 삭제"
                      >
                        <X size={12} />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">기존</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 새로운 이미지들 */}
            {images.length > 0 && (
              <div className="mb-4">
                <p className={`text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  새로 추가할 이미지 ({images.length}개)
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {images.map((image, index) => (
                    <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`새 이미지 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        title="새 이미지 삭제"
                      >
                        <X size={12} />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">새로운</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 이미지 추가 버튼 */}
            {totalImages < 5 && (
              <div className="grid grid-cols-5 gap-3">
                <label
                  className={`aspect-square rounded-lg border-2 border-dashed cursor-pointer flex flex-col items-center justify-center transition-colors ${
                    isDarkMode
                      ? "border-gray-600 hover:border-gray-500 bg-gray-700/50 hover:bg-gray-700"
                      : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                  <Plus size={24} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                  <span className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>추가</span>
                </label>
              </div>
            )}
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

          {/* 상태 선택 필드 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              판매 상태 *
            </label>
            <div className="space-y-3">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.status === option.value
                      ? isDarkMode
                        ? "border-blue-400 bg-blue-500/10"
                        : "border-blue-500 bg-blue-50"
                      : isDarkMode
                        ? "border-gray-600 hover:border-gray-500 bg-gray-700/30"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={formData.status === option.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1">
                      <div className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{option.label}</div>
                      <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {option.description}
                      </div>
                    </div>
                    {formData.status === option.value && (
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          isDarkMode ? "bg-blue-400" : "bg-blue-500"
                        }`}
                      >
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
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
              {isSubmitting ? "수정 중..." : "상품 수정"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProductModal
