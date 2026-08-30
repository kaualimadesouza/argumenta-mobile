import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native'

import { ANNOTATION_LABEL } from '@/copy/labels'
import { colors, fontFamily, typeScale, radius, tracking } from "@/styles/tokens"
import type { AnnotatedSegment, Mark } from './spans'
import { Button } from '@/components/Button'

export function MarkedText({ segments }: { segments: AnnotatedSegment[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const openMark = segments.find((segment) => segment.mark === open && segment.annotation !== null)

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Seu texto, corrigido</Text>
      
      <Text style={styles.textBlock}>
        {segments.map((segment, index) => {
          if (segment.annotation === null) {
            return <Text key={index} style={styles.plain}>{segment.text}</Text>
          }

          const isPraise = segment.annotation.severity === 'praise'
          const isSelected = open === segment.mark

          return (
            <Text
              key={index}
              onPress={() => setOpen(isSelected ? null : segment.mark)}
              style={[
                styles.markText,
                isPraise ? styles.markPraise : styles.markSlip,
                isSelected && styles.markSelected,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${segment.text}: ${segment.annotation.message}`}
            >
              {segment.text}
            </Text>
          )
        })}
      </Text>

      <Modal
        visible={open !== null && openMark !== undefined}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(null)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setOpen(null)} />
          <View style={styles.sheet}>
            <View style={styles.sheetDrag} />
            {openMark?.annotation && (
              <ScrollView contentContainerStyle={styles.sheetContent}>
                <Text style={styles.sheetKind}>
                  {ANNOTATION_LABEL[openMark.annotation.type]}
                </Text>
                <Text style={styles.sheetMessage}>
                  {openMark.annotation.message}
                </Text>
                {openMark.annotation.suggestion && (
                  <View style={styles.sheetSuggestion}>
                    <Text style={styles.sheetSuggestionLabel}>Sugestão</Text>
                    <Text style={styles.sheetSuggestionText}>{openMark.annotation.suggestion}</Text>
                  </View>
                )}
                <Button onPress={() => setOpen(null)}>Fechar</Button>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

export function Legend({ marks }: { marks: Mark[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>As marcações</Text>
      <View style={styles.legend}>
        {marks.map(({ number, annotation }) => {
          const isPraise = annotation.severity === 'praise'
          return (
            <View key={number} style={styles.legendItem}>
              <View style={[styles.badge, isPraise ? styles.badgePraise : styles.badgeSlip]}>
                <Text style={[styles.badgeText, isPraise ? styles.badgeTextPraise : styles.badgeTextSlip]}>
                  {number}
                </Text>
              </View>
              <Text style={styles.legendText}>
                <Text style={styles.legendKind}>{`${ANNOTATION_LABEL[annotation.type]}. `}</Text>
                <Text>{annotation.message}</Text>
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 16,
    gap: 16,
  },
  cardTitle: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.lead,
    color: colors.ink,
  },
  textBlock: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.body,
    color: colors.ink,
    
  },
  plain: {
    fontFamily: fontFamily.medium,
  },
  markText: {
    fontFamily: fontFamily.medium,
  },
  markPraise: {
    backgroundColor: colors.marcaTexto,
  },
  markSlip: {
    textDecorationLine: 'underline',
    textDecorationColor: colors.corretor,
  },
  markSelected: {
    opacity: 0.7, // Visual feedback when selected
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    padding: 24,
    maxHeight: '80%',
  },
  sheetDrag: {
    width: 40,
    height: 4,
    backgroundColor: colors.ink,
    opacity: 0.2,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetContent: {
    gap: 16,
    paddingBottom: 32,
  },
  sheetKind: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.meta,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: colors.ink,
    opacity: 0.6,
  },
  sheetMessage: {
    fontFamily: fontFamily.medium,
    fontSize: typeScale.lead,
    color: colors.ink,
    
  },
  sheetSuggestion: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: radius.card,
    gap: 4,
  },
  sheetSuggestionLabel: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.micro,
    fontWeight: 'bold',
    color: colors.caneta,
    textTransform: 'uppercase',
  },
  sheetSuggestionText: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.body,
    color: colors.ink,
  },
  legend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  badgePraise: {
    backgroundColor: colors.marcaTexto,
  },
  badgeSlip: {
    backgroundColor: colors.corretor,
  },
  badgeText: {
    fontFamily: fontFamily.regular,
    fontSize: typeScale.micro,
    fontWeight: 'bold',
  },
  badgeTextPraise: {
    color: colors.ink,
  },
  badgeTextSlip: {
    color: colors.card,
  },
  legendText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: typeScale.meta,
    color: colors.ink,
    
  },
  legendKind: {
    fontWeight: 'bold',
  },
})
